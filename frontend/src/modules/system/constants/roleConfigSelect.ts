import { SystemConfigVMSystemRoleConfigEnum } from "@/shared/services/api";

export const ROLE_CONFIG_LABEL = {
    [SystemConfigVMSystemRoleConfigEnum.None]: 'Không có',
    [SystemConfigVMSystemRoleConfigEnum.One]: 'Chọn một',
    [SystemConfigVMSystemRoleConfigEnum.Many]: 'Chọn nhiều',
}