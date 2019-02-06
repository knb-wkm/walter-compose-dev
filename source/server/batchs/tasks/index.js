import analyze from "./analyze";
import initElasticsearch from "./initElasticsearch";
import moveInvisibleFiles from "./moveInvisibleFiles";
import createAdmin from "./createAdmin";
import deleteAdmin from "./deleteAdmin";

import addTenant from "./addTenant";

export const AnalyzeTask = () => analyze();

export const initElasticsearchTask = () => initElasticsearch();

export const moveInvisibleFilesTask = () => moveInvisibleFiles();

export const createAdminTask = () => createAdmin();

export const deleteAdminTask = () => deleteAdmin();

export const addTenantTask = () => addTenant();
