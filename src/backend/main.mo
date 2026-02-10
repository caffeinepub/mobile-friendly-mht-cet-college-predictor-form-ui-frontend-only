import Runtime "mo:core/Runtime";
import List "mo:core/List";
import Nat "mo:core/Nat";

actor {
  public type Prediction = {
    college : Text;
    branch : Text;
    chance : Text;
  };

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
};
