import Map "mo:core/Map";
import Text "mo:core/Text";
import Iter "mo:core/Iter";
import MixinStorage "blob-storage/Mixin";

actor {
  include MixinStorage();

  // Global labels map (legacy - kept for compatibility)
  let labels = Map.empty<Text, Text>();

  // Per-user data store: Principal -> (module -> jsonBlob)
  let userData = Map.empty<Text, Map.Map<Text, Text>>();

  // Username/password auth store: username -> {passwordHash, recoveryHash, userId}
  type UserCredential = {
    passwordHash : Text;
    recoveryHash : Text;
    userId : Text;
  };
  let usersById = Map.empty<Text, UserCredential>(); // username -> credential

  // ---- Per-user data sync (by ICP principal) ----

  public shared ({ caller }) func storeUserData(module_ : Text, jsonData : Text) : async () {
    let key = caller.toText();
    switch (userData.get(key)) {
      case (null) {
        let userMap = Map.empty<Text, Text>();
        userMap.add(module_, jsonData);
        userData.add(key, userMap);
      };
      case (?userMap) {
        userMap.add(module_, jsonData);
      };
    };
  };

  public query ({ caller }) func getUserData(module_ : Text) : async ?Text {
    let key = caller.toText();
    switch (userData.get(key)) {
      case (null) { null };
      case (?userMap) { userMap.get(module_) };
    };
  };

  public query ({ caller }) func getUserModules() : async [Text] {
    let key = caller.toText();
    switch (userData.get(key)) {
      case (null) { [] };
      case (?userMap) {
        userMap.keys().toArray();
      };
    };
  };

  public shared ({ caller }) func deleteUserData(module_ : Text) : async () {
    let key = caller.toText();
    switch (userData.get(key)) {
      case (null) {};
      case (?userMap) {
        userMap.remove(module_);
      };
    };
  };

  // ---- Per-user data sync (by userId key - for username/password auth) ----

  public shared ({ caller = _ }) func storeUserDataByKey(userId : Text, module_ : Text, jsonData : Text) : async () {
    switch (userData.get(userId)) {
      case (null) {
        let userMap = Map.empty<Text, Text>();
        userMap.add(module_, jsonData);
        userData.add(userId, userMap);
      };
      case (?userMap) {
        userMap.add(module_, jsonData);
      };
    };
  };

  public query ({ caller = _ }) func getUserDataByKey(userId : Text, module_ : Text) : async ?Text {
    switch (userData.get(userId)) {
      case (null) { null };
      case (?userMap) { userMap.get(module_) };
    };
  };

  // ---- Username/password authentication ----

  public shared ({ caller = _ }) func registerUser(username : Text, passwordHash : Text, recoveryHash : Text, userId : Text) : async { #ok; #err : Text } {
    switch (usersById.get(username)) {
      case (?_) { #err("Username already taken") };
      case (null) {
        usersById.add(username, { passwordHash; recoveryHash; userId });
        #ok;
      };
    };
  };

  public query ({ caller = _ }) func loginUser(username : Text, passwordHash : Text) : async { #ok : Text; #err : Text } {
    switch (usersById.get(username)) {
      case (null) { #err("Invalid username or password") };
      case (?cred) {
        if (cred.passwordHash == passwordHash) {
          #ok(cred.userId);
        } else {
          #err("Invalid username or password");
        };
      };
    };
  };

  public shared ({ caller = _ }) func resetPasswordWithRecovery(username : Text, recoveryHash : Text, newPasswordHash : Text) : async { #ok; #err : Text } {
    switch (usersById.get(username)) {
      case (null) { #err("Username not found") };
      case (?cred) {
        if (cred.recoveryHash == recoveryHash) {
          usersById.add(username, { passwordHash = newPasswordHash; recoveryHash = cred.recoveryHash; userId = cred.userId });
          #ok;
        } else {
          #err("Invalid recovery code");
        };
      };
    };
  };

  // ---- Legacy global label management ----

  public shared ({ caller = _ }) func initializeDefaultLabels() : async () {
    labels.add("all", "All");
    labels.add("welcome", "Welcome");
    labels.add("work", "Work");
    labels.add("personal", "Personal");
    labels.add("ideas", "Ideas");
  };

  public shared ({ caller = _ }) func addLabel(id : Text, name : Text) : async Bool {
    switch (labels.get(id)) {
      case (null) {
        labels.add(id, name);
        true;
      };
      case (?_) { false };
    };
  };

  public shared ({ caller = _ }) func renameLabel(id : Text, newName : Text) : async Bool {
    if (id == "all") { return false };
    switch (labels.get(id)) {
      case (?_) {
        labels.add(id, newName);
        true;
      };
      case (null) { false };
    };
  };

  public shared ({ caller = _ }) func deleteLabel(id : Text) : async Bool {
    if (id == "all") { return false };
    switch (labels.get(id)) {
      case (?_) {
        labels.remove(id);
        true;
      };
      case (null) { false };
    };
  };

  public query ({ caller = _ }) func getLabel(id : Text) : async ?Text {
    labels.get(id);
  };

  public query ({ caller = _ }) func getAllLabels() : async [(Text, Text)] {
    labels.toArray();
  };
};
