import List "mo:core/List";
import Nat "mo:core/Nat";
import Array "mo:core/Array";
import Text "mo:core/Text";
import Runtime "mo:core/Runtime";
import Iter "mo:core/Iter";
import Int "mo:core/Int";
import Char "mo:core/Char";
import Float "mo:core/Float";

actor {
  public type CutoffsRecord = {
    closing_rank : Nat;
    college_name : Text;
    branch_name : Text;
    category : Text;
    gender : Text;
    seat_type : Text;
  };

  public type Prediction = {
    college_name : Text;
    branch_name : Text;
    closing_rank : Nat;
    predicted_rank : Nat;
    eligible : Bool;
  };

  type ImportResult = {
    records_imported : Nat;
    errors : [(Nat, Text)];
    total_rows : Nat;
  };

  type Candidature = {
    #maharashtra;
    #allIndia;
  };

  let cutoffs = List.empty<CutoffsRecord>();

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

  public shared ({ caller }) func importCutoffsCsv(csvText : Text) : async ImportResult {
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

  public shared ({ caller }) func predictAdmission(userPercentile : Text, candidature : Candidature) : async [Prediction] {
    let trimmed = userPercentile.trim(#char ' ');

    switch (Nat.fromText(trimmed)) {
      case (?percentile) {
        if (percentile > 100) {
          Runtime.trap("Percentile must be in range 0-100. Provided value: " # percentile.toText());
        };

        let predicted_rank = computeRank(candidature, percentile);

        getRecordsByCandidature(candidature)
        .filter(func(rec) { predicted_rank <= rec.closing_rank })
        .map(
          func(rec) {
            {
              college_name = rec.college_name;
              branch_name = rec.branch_name;
              closing_rank = rec.closing_rank;
              predicted_rank;
              eligible = true;
            };
          }
        ).toArray();
      };
      case (null) {
        Runtime.trap("Invalid percentile value: " # userPercentile);
        [];
      };
    };
  };

  public func getPredictions(college : Text, branch : Text, category : Text, gender : Text, seat_type : Text) : async [Prediction] {
    ignore (college, branch, category, gender, seat_type);
    [];
  };
};
