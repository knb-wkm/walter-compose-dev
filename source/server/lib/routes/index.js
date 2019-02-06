import { Router } from "express";
import BeforeRouter from "./before";
import LoginRouter from "./login";
import UserRouter from "./users";
import FileRouter from "./files";
import DirRouter from "./dirs";
import TagRouter from "./tags";
import MetaInfoRouter from "./metaInfos";
import GroupRouter from "./groups";
import RoleFileRouter from "./roleFiles";
import RoleMenuRouter from "./roleMenus";
import ActionRouter from "./actions";
import AnalysisRouter from "./analysis";
import ClientRouter from "./clients";
import PreviewRouter from "./previews";
import AuthorityFileRouter from "./authorityFiles";
import AuthorityMenuRouter from "./authorityMenus";
import MenuRouter from "./menus";
import notificationRouter from "./notifications";
import DisplayItemRouter from "./displayItems";
import ExcelRouter from "./excels";
import ElasticsearchRouter from "./elasticsearches";
import DownloadInfoRouter from "./downloadInfos";
import AppSettingRouter from "./appSettings";

// debug
import TestRouter from "./test";

const router = Router();

router.use("/api/v1/*", BeforeRouter);
router.use("/api/login", LoginRouter);
router.use("/api/v1/users", UserRouter);
router.use("/api/v1/files", FileRouter);
router.use("/api/v1/elasticsearch", ElasticsearchRouter);
router.use("/api/v1/dirs", DirRouter);
router.use("/api/v1/tags", TagRouter);
router.use("/api/v1/meta_infos", MetaInfoRouter);
router.use("/api/v1/groups", GroupRouter);
router.use("/api/v1/role_files", RoleFileRouter);
router.use("/api/v1/role_menus", RoleMenuRouter);
router.use("/api/v1/actions", ActionRouter);
router.use("/api/v1/analysis", AnalysisRouter);
router.use("/api/v1/previews", PreviewRouter);
router.use("/api/v1/authority_files", AuthorityFileRouter);
router.use("/api/v1/authority_menus", AuthorityMenuRouter);
router.use("/api/v1/menus", MenuRouter);
router.use("/api/v1/notifications", notificationRouter);
router.use("/api/v1/display_items", DisplayItemRouter);
router.use("/api/v1/excels", ExcelRouter);
router.use("/api/v1/download_info", DownloadInfoRouter);
router.use("/api/v1/app_settings", AppSettingRouter);

router.use("/*",ClientRouter);

// debug
router.use("/test", TestRouter);

export default router;
