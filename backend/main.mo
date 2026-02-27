import Map "mo:core/Map";
import Text "mo:core/Text";
import Iter "mo:core/Iter";

actor {
  // Persistent labels map
  let labels = Map.empty<Text, Text>();

  public shared ({ caller }) func initializeDefaultLabels() : async () {
    labels.add("all", "All");
    labels.add("welcome", "Welcome");
    labels.add("work", "Work");
    labels.add("personal", "Personal");
    labels.add("ideas", "Ideas");
  };

  public shared ({ caller }) func addLabel(id : Text, name : Text) : async Bool {
    switch (labels.get(id)) {
      case (null) {
        labels.add(id, name);
        true;
      };
      case (?_) { false };
    };
  };

  public shared ({ caller }) func renameLabel(id : Text, newName : Text) : async Bool {
    if (id == "all") { return false };

    switch (labels.get(id)) {
      case (?_) {
        labels.add(id, newName);
        true;
      };
      case (null) { false };
    };
  };

  public shared ({ caller }) func deleteLabel(id : Text) : async Bool {
    if (id == "all") { return false };

    switch (labels.get(id)) {
      case (?_) {
        labels.remove(id);
        true;
      };
      case (null) { false };
    };
  };

  public query ({ caller }) func getLabel(id : Text) : async ?Text {
    labels.get(id);
  };

  public query ({ caller }) func getAllLabels() : async [(Text, Text)] {
    labels.toArray();
  };
};
