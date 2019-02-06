import rolesReducer from "../rolesReducer";
import ROLES from "../../mock-roles";

describe("rolesReducer", () => {

  describe("default", () => {
    it("ロール一覧が返却される", () => {
      const result = rolesReducer(ROLES, {});
      const expected = ROLES.length;
      expect(result.length).toEqual(expected);
    });
  });

});
