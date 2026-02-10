import List "mo:core/List";

module {
  public type OldActor = {};
  public type NewActor = { cutoffs : List.List<{ closing_rank : Float; college_name : Text; branch_name : Text; category : Text; gender : Text; seat_type : Text; percentile : Float }> };

  public func run(_ : OldActor) : NewActor {
    { cutoffs = List.empty<{ closing_rank : Float; college_name : Text; branch_name : Text; category : Text; gender : Text; seat_type : Text; percentile : Float }>() };
  };
};

