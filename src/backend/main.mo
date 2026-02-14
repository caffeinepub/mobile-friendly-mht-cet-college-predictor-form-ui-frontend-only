import Array "mo:core/Array";
import List "mo:core/List";
import Map "mo:core/Map";
import Nat "mo:core/Nat";
import Text "mo:core/Text";
import Runtime "mo:core/Runtime";
import Iter "mo:core/Iter";
import Int "mo:core/Int";
import Char "mo:core/Char";
import Float "mo:core/Float";
import Principal "mo:core/Principal";

import AccessControl "authorization/access-control";
import MixinAuthorization "authorization/MixinAuthorization";

actor {
  // Initialize the access control system
  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);

  // User Profile System
  public type UserProfile = {
    name : Text;
  };

  let userProfiles = Map.empty<Principal, UserProfile>();

  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can access profiles");
    };
    userProfiles.get(caller);
  };

  public query ({ caller }) func getUserProfile(user : Principal) : async ?UserProfile {
    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own profile");
    };
    userProfiles.get(user);
  };

  public shared ({ caller }) func saveCallerUserProfile(profile : UserProfile) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can save profiles");
    };
    userProfiles.add(caller, profile);
  };

  // Application Types
  public type CutoffsRecord = {
    closing_rank : Nat;
    college_name : Text;
    branch_name : Text;
    category : Text;
    gender : Text;
    seat_type : Text;
  };

  public type PredictStep1 = {
    category : Text;
    gender : ?Text;
    branchName : ?Text;
    college : ?Text;
  };

  public type Prediction = {
    college_name : Text;
    branch_name : Text;
    closing_rank : Nat;
    predicted_rank : Nat;
    eligible : Bool;
    predicted_percentile : Float;
  };

  public type Lead = {
    name : Text;
    mobile : Text;
    whatsapp : Text;
    telegram : Bool;
    email : ?Text;
  };

  public type ImportResult = {
    records_imported : Nat;
    errors : [(Nat, Text)];
    total_rows : Nat;
  };

  public type Candidature = {
    #maharashtra;
    #allIndia;
  };

  let cutoffs = List.empty<CutoffsRecord>();
  let leads = Map.empty<Nat, Lead>();
  var nextLeadId = 0;

  // Public query functions for cutoffs data (no auth required - educational data)
  public query ({ caller }) func getCutoffsCount() : async Nat {
    cutoffs.size();
  };

  public query ({ caller }) func getCutoffsRange(start : Nat, limit : Nat) : async [CutoffsRecord] {
    if (start >= cutoffs.size()) {
      return [];
    };

    let end = if (start + limit > cutoffs.size()) {
      cutoffs.size();
    } else { start + limit };

    cutoffs.sliceToArray(start, end);
  };

  public query ({ caller }) func getMaxClosingRank() : async ?Nat {
    if (cutoffs.isEmpty()) {
      return null;
    };
    ?cutoffs.foldLeft(
      cutoffs.at(0).closing_rank,
      func(max, record) { Nat.max(max, record.closing_rank) },
    );
  };

  // Admin-only: Import cutoffs data
  public shared ({ caller }) func importCutoffsCsv(csvText : Text) : async ImportResult {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can import cutoffs data");
    };

    let lines = csvText.split(
      #predicate(func(c) { c == '\n' or c == '\r' })
    ).toArray();
    let totalRows = lines.size();
    if (totalRows <= 1) {
      return {
        records_imported = 0;
        errors = [(0, "No data rows found")];
        total_rows = totalRows;
      };
    };

    let validLines = lines.sliceToArray(1, totalRows);

    let parsedRecords = List.empty<CutoffsRecord>();
    let errorsList = List.empty<(Nat, Text)>();

    var i = 0;
    while (i < validLines.size()) {
      let line = validLines[i];
      let fields = line.split(#char ',').toArray();
      switch (parseRecord(fields, i + 2)) {
        case (#parsed(record)) { parsedRecords.add(record) };
        case (#error(lineNumber, errMsg)) { errorsList.add((lineNumber, errMsg)) };
      };
      i += 1;
    };

    cutoffs.addAll(parsedRecords.values());

    {
      records_imported = parsedRecords.size();
      errors = errorsList.toArray();
      total_rows = totalRows - 1;
    };
  };

  func parseRecord(fields : [Text], lineNumber : Nat) : { #parsed : CutoffsRecord; #error : (Nat, Text) } {
    if (fields.size() != 7) {
      return #error(lineNumber, "Expected 7 fields, found " # fields.size().toText());
    };

    let closingRankText = fields[0].trim(#char ' ');
    let closingRankOpt = Nat.fromText(closingRankText);

    switch (closingRankOpt) {
      case (?closing_rank) {
        #parsed({
          closing_rank;
          college_name = fields[1].trim(#char ' ');
          branch_name = fields[2].trim(#char ' ');
          category = fields[3].trim(#char ' ');
          gender = fields[4].trim(#char ' ');
          seat_type = fields[5].trim(#char ' ');
        });
      };
      case (null) {
        #error(lineNumber, "Invalid closing_rank value: " # closingRankText);
      };
    };
  };

  public shared ({ caller }) func predictAdmissionStep1(userPercentile : Text, step1 : PredictStep1, candidature : Candidature) : async [Prediction] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can generate predictions");
    };

    // Validate and normalize percentile
    let trimmed = userPercentile.trim(#char ' ');

    switch (Nat.fromText(trimmed)) {
      case (?percentile) {
        if (percentile > 100) {
          Runtime.trap("Percentile must be in range 0-100. Provided value: " # percentile.toText());
          return [];
        };

        let predicted_rank = computeRank(candidature, percentile);

        let filteredRecords = filterCutoffsByStep1Internal(step1);

        filteredRecords.filter(
          func(rec) { predicted_rank <= rec.closing_rank }
        ).map(
          func(rec) {
            {
              college_name = rec.college_name;
              branch_name = rec.branch_name;
              closing_rank = rec.closing_rank;
              predicted_rank;
              predicted_percentile = percentile.toFloat();
              eligible = true;
            };
          }
        );
      };
      case (null) {
        Runtime.trap("Invalid percentile value: " # userPercentile);
        [];
      };
    };
  };

  func filterCutoffsByStep1Internal(step : PredictStep1) : [CutoffsRecord] {
    if (cutoffs.isEmpty()) { return [] };

    let normalizedGender = switch (step.gender) {
      case (?gender) { ?gender.toUpper() };
      case (null) { null };
    };

    cutoffs.toArray().filter(
      func(record) {
        record.category == step.category and
        (switch (normalizedGender, record.gender == "ANY") {
          case (null, _) { true };
          case (?recordGender, true) { true };
          case (?recordGender, false) { recordGender == record.gender };
        }) and
        (switch (step.branchName) {
          case (null) { true };
          case (?branchName) { branchName == record.branch_name };
        });
      }
    );
  };

  func getRecordsByCandidature(candidature : Candidature) : Iter.Iter<CutoffsRecord> {
    switch (candidature) {
      case (#maharashtra) {
        cutoffs.values().filter(func(record) { record.seat_type.startsWith(#text "MS") });
      };
      case (#allIndia) {
        cutoffs.values().filter(func(record) { record.seat_type.startsWith(#text "AI") });
      };
    };
  };

  func computeRank(candidature : Candidature, percentile : Nat) : Nat {
    let normalizedPercentile = if (percentile > 100) { 100 } else { percentile };

    switch (candidature) {
      case (#maharashtra) {
        (Int.abs(100 - normalizedPercentile) * 2000).toNat();
      };
      case (#allIndia) {
        (Int.abs(100 - normalizedPercentile) * 10000).toNat();
      };
    };
  };

  // User-level: Add lead (requires authentication)
  public shared ({ caller }) func addLead(name : Text, mobile : Text, whatsapp : Text, telegram : Bool, email : ?Text) : async Nat {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can add leads");
    };

    let leadId = nextLeadId;
    let newLead : Lead = {
      name;
      mobile;
      whatsapp;
      telegram;
      email;
    };
    leads.add(leadId, newLead);
    nextLeadId += 1;
    leadId;
  };

  // Admin-only: Get individual lead
  public query ({ caller }) func getLead(leadId : Nat) : async ?Lead {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can access lead data");
    };
    leads.get(leadId);
  };

  // Admin-only: Get all leads
  public query ({ caller }) func getAllLeads() : async [(Nat, Lead)] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can access all leads");
    };
    leads.toArray();
  };

  // Admin-only: Export leads to CSV
  public query ({
    caller
  }) func exportLeadsAsCsv() : async Text {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can export leads");
    };

    let header = "LeadId,Name,Mobile,Whatsapp,Telegram,Email\n";
    let csvRows = leads.toArray().map(
      func((id, lead)) {
        let emailStr = switch (lead.email) {
          case (null) { "" };
          case (?email) { email };
        };
        id.toText() # "," # lead.name # "," # lead.mobile # "," # lead.whatsapp # "," # (if (lead.telegram) { "true" } else { "false" }) # "," # emailStr;
      }
    );

    var csvBody = "";
    let csvRowsLength = csvRows.size();
    for (i in Nat.range(0, csvRowsLength)) {
      csvBody #= csvRows[i];
      if (i < csvRowsLength - 1) {
        csvBody #= "\n";
      };
    };

    header # csvBody;
  };

};
