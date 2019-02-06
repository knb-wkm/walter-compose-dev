import dirsReducer from "../dirsReducer";

describe("dirsReducer", () => {
  let DIRS;
  let FILES;

  beforeEach( () => {
    DIRS = [
      {ancestor: 0, descendant: 0, depth: 0},
      {ancestor: 4, descendant: 4, depth: 0},
      {ancestor: 5, descendant: 5, depth: 0},
      {ancestor: 0, descendant: 4, depth: 1},
      {ancestor: 0, descendant: 5, depth: 1},
      {ancestor: 0, descendant: 6, depth: 2},
      {ancestor: 4, descendant: 6, depth: 1},
    ];
  });

  describe("default", () => {
    it("そのまんまstateが返却される", () => {
      const result = dirsReducer(DIRS, {});
      expect(result).toEqual(DIRS);
    });
  });

  describe("DIR_TREE", () => {

    it("ツリーコンポーネントで描画できるオブジェクトが返却される", () => {
      const result = dirsReducer(DIRS, {
        type: "DIR_TREE"
      });

      const expected = {
        id: 0,
        children: [
          {
            id: 4,
            children: [
              {
                id: 6,
                children: []
              }
            ]
          },
          {
            id: 5,
            children: []
          }
        ]
      };

      expect(result).toEqual(expected);

    });

  });

  describe("ADD_DIR_TREE", () => {

    it("root子に追加した後、追加した結果が返却される", () => {

      const result = dirsReducer(DIRS, {
        type: "ADD_DIR_TREE",
        parent: { id: 0 },
        dir: { id: 7, name: "foobar" }
      });

      const expected = [
        {ancestor: 0, descendant: 0, depth: 0},
        {ancestor: 4, descendant: 4, depth: 0},
        {ancestor: 5, descendant: 5, depth: 0},
        {ancestor: 0, descendant: 4, depth: 1},
        {ancestor: 0, descendant: 5, depth: 1},
        {ancestor: 0, descendant: 6, depth: 2},
        {ancestor: 4, descendant: 6, depth: 1},
        {ancestor: 7, descendant: 7, depth: 0},
        {ancestor: 0, descendant: 7, depth: 1},        
      ];

      expect(result).toEqual(expected);

    });

    it("rootの孫に追加した後、追加した結果が返却される", () => {

      const result = dirsReducer(DIRS, {
        type: "ADD_DIR_TREE",
        parent: { id: 5 },
        dir: { id: 7, name: "foobar" }
      });

      const expected = [
        {ancestor: 0, descendant: 0, depth: 0},
        {ancestor: 4, descendant: 4, depth: 0},
        {ancestor: 5, descendant: 5, depth: 0},
        {ancestor: 0, descendant: 4, depth: 1},
        {ancestor: 0, descendant: 5, depth: 1},
        {ancestor: 0, descendant: 6, depth: 2},
        {ancestor: 4, descendant: 6, depth: 1},
        {ancestor: 7, descendant: 7, depth: 0},
        {ancestor: 5, descendant: 7, depth: 1},
        {ancestor: 0, descendant: 7, depth: 2}
      ];

      expect(result).toEqual(expected);

    });

    it("rootの曾孫に追加した後、追加した結果が返却される", () => {

      const result = dirsReducer(DIRS, {
        type: "ADD_DIR_TREE",
        parent: { id: 6 },
        dir: { id: 7, name: "foobar" }
      });

      const expected = [
        {ancestor: 0, descendant: 0, depth: 0},
        {ancestor: 4, descendant: 4, depth: 0},
        {ancestor: 5, descendant: 5, depth: 0},
        {ancestor: 0, descendant: 4, depth: 1},
        {ancestor: 0, descendant: 5, depth: 1},
        {ancestor: 0, descendant: 6, depth: 2},
        {ancestor: 4, descendant: 6, depth: 1},
        {ancestor: 7, descendant: 7, depth: 0},
        {ancestor: 6, descendant: 7, depth: 1},
        {ancestor: 0, descendant: 7, depth: 3},
        {ancestor: 4, descendant: 7, depth: 2}
      ];

      expect(result).toEqual(expected);

    });

  });

  describe("DIR_ROUTE", () => {
    it("子のディレクトリに至るルートを返却する", () => {

      const result = dirsReducer(DIRS, {
        type: "DIR_ROUTE",
        dir: { id: 4 }
      });

      const expected = [ { id: 0 }, {id: 4} ];

      expect(result).toEqual(expected);
    });

    it("孫のディレクトリに至るルートを返却する", () => {

      const result = dirsReducer(DIRS, {
        type: "DIR_ROUTE",
        dir: { id: 6 }
      });

      const expected = [ { id: 0 }, {id: 4}, { id: 6} ];

      expect(result).toEqual(expected);
    });

  });

  describe("DELETE_DIR_TREE", () => {
    it("削除後の一覧が返却される", () => {

      const dir = { id: 4 };
      const result = dirsReducer(DIRS, {
        type: "DELETE_DIR_TREE",
        dir
      });

      expect(
        result.filter(r => r.ancestor === dir.id || r.descendant === dir.id).length
      ).toEqual(0);

    });
  });

});
