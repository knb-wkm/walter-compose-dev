import mongoose from "mongoose";
import co from "co";

// logger
import logger from "../../lib/logger";

// models
import User from "../../lib/models/User";
import Tenant from "../../lib/models/Tenant";
import RoleMenu from "../../lib/models/RoleMenu";
import AuthorityMenu from "../../lib/models/AuthorityMenu";

const task = () => {
  co(function* () {
		try {
      logger.info("################# delete admin start #################");
			const tenant_name = process.argv[3];
			if ( tenant_name === undefined ) throw "テナントを指定してください";

			logger.info("tenant name: " + tenant_name);

			const tenant = yield Tenant.findOne({name:tenant_name});
			if (tenant === null) throw "指定されたテナントが見つかりません";

			const admin_user = yield User.findOne({account_name:"admin"});

			if(admin_user === null) throw "管理者は存在しません";

			yield RoleMenu.remove({name:"システム管理者"});
			yield AuthorityMenu.remove({users:admin_user});
			yield User.remove({account_name:"admin"});

			console.log("システム管理者を削除しました");
      logger.info("################# delete admin end #################");

		} catch (error) {
      logger.error(error);
			console.log(error);
		} finally{

			process.exit();
		}


	});
};

export default task;