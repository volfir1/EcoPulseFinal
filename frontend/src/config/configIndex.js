import { DEV_CONFIG } from "./development";
import { PROD_CONFIG } from "./production";
export {default as DevToolbar} from './DevToolbar'

export const CONFIG = process.env.NODE_ENV === 'development' ? DEV_CONFIG : PROD_CONFIG;