import mongoose from "mongoose";
import co from "co";

// logger
import logger from "../../lib/logger";

// models
import User from "../../lib/models/User";
import Tenant from "../../lib/models/Tenant";
import RoleMenu from "../../lib/models/RoleMenu";
import Group from "../../lib/models/Group";
import AuthorityMenu from "../../lib/models/AuthorityMenu";
import Menu from "../../lib/models/Menu";

const task = () => {
  co(function* () {
		try {
      logger.info("################# create admin start #################");
			const tenant_name = process.argv[3];
			if ( tenant_name === undefined ) throw "テナントを指定してください";

			logger.info("tenant name: " + tenant_name);

			const tenant = yield Tenant.findOne({name:tenant_name});
			if (tenant === null) throw "指定されたテナントが見つかりません";

			const _admin_user = yield User.find({account_name:"admin", tenant_id:tenant._id }).count();
			if(_admin_user > 0 ) throw "すでにシステム管理者は存在します";

			const admin_user = new User();
			const pass = "c7ad44cbad762a5da0a452f9e854fdc1e0e7a52a38015f23f3eab1d80b931dd472634dfac71cd34ebc35d16ab7fb8a90c81f975113d6c7538dc69dd8de9077ec";

			admin_user.type = "user";
			admin_user.account_name = "admin";
			admin_user.name = "admin";
			admin_user.email = "admin";
			admin_user.password = pass;
			admin_user.enabled = true;
			admin_user.tenant_id = tenant._id;
			admin_user.groups = [ (yield Group.findOne({ name: "全社" }, {_id: 1}))._id ];

			const menu = (yield Menu.find({},{_id:1})).map(m => m._id);

			const role = new RoleMenu();
			role.name = "システム管理者";
			role.description = "";
			role.menus = menu;
			role.tenant_id = tenant._id;

			yield role.save();

      const authority_menus = new AuthorityMenu;
      authority_menus.role_menus = role._id;
      authority_menus.users = admin_user;
			authority_menus.groups = null;

      const {createdUser,createdAuthorityMenu} = yield { createdUser:admin_user.save(), createdAuthorityMenu:authority_menus.save() };

			console.log("システム管理者を作成しました");
      logger.info("################# create admin end #################");

		} catch (error) {
      logger.error(error);
			console.log(error);
		} finally{

			process.exit();
		}


	});
};

export default task;