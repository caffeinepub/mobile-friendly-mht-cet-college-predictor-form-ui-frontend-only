import List "mo:core/List";
import Text "mo:core/Text";
import Runtime "mo:core/Runtime";
import Float "mo:core/Float";
import Migration "migration";
import Nat32 "mo:core/Nat32";

(with migration = Migration.run)
actor {
  public type CutoffsRecord = {
    closing_rank : Float;
    college_name : Text;
    branch_name : Text;
    category : Text;
    gender : Text;
    seat_type : Text;
    percentile : Float;
  };

  type Prediction = {
    college : Text;
    branch : Text;
    chance : Text;
  };

  let cutoffs = List.empty<CutoffsRecord>();

  public shared ({ caller }) func predictAdmission(userPercentile : Float) : async [Prediction] {
    if (userPercentile < 0 or userPercentile > 100) {
      Runtime.trap("Percentile must be between 0 and 100");
    };

    let approxRank = (100.0 - userPercentile) * 100_000;

    let predictions = List.fromArray<Prediction>([
      {
        college = "IIT Madras";
        branch = "Computer Science";
        chance = if (approxRank < 500) { "Dream" } else if (approxRank < 2000) {
          "Probable";
        } else { "Safe" };
      },
      {
        college = "IIT Bombay";
        branch = "Electrical Engineering";
        chance = if (approxRank < 1000) { "Dream" } else if (approxRank < 3000) {
          "Probable";
        } else { "Safe" };
      },
      {
        college = "IIT Delhi";
        branch = "Mechanical";
        chance = if (approxRank < 2000) { "Dream" } else if (approxRank < 5000) {
          "Probable";
        } else { "Safe" };
      },
    ]);

    predictions.toArray();
  };

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

  public func getPredictions(college : Text, branch : Text, category : Text, gender : Text, seat_type : Text) : async [Prediction] {
    ignore (college, branch, category, gender, seat_type);
    [];
  };
};

