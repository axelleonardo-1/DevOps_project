variable "cloudflare_api_token" {
  description = "Cloudflare API token used by the Terraform provider."
  type        = string
  sensitive   = true
}

variable "account_id" {
  description = "Cloudflare account ID."
  type        = string
}

variable "project_name" {
  description = "Base project name used to derive Cloudflare resource names."
  type        = string
}

variable "environment" {
  description = "Human-readable environment label for plans or demos."
  type        = string
  default     = "shared"
}

variable "enable_r2" {
  description = "Whether to create R2 buckets for product images."
  type        = bool
  default     = true
}

variable "r2_location" {
  description = "Optional R2 location hint."
  type        = string
  default     = "wnam"
}

variable "d1_primary_location_hint" {
  description = "Optional D1 primary location hint."
  type        = string
  default     = "wnam"
}
