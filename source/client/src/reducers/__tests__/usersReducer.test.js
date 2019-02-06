import usersReducer from "../usersReducer";
import USERS from "../../mock-users";

describe("usersReducer", () => {

  describe("default", () => {
    it("ユーザ一覧が返却される", () => {
      const result = usersReducer(USERS, {});
      const expected = USERS.length;
      expect(result.length).toEqual(expected);
    });
  });

});
