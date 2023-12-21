package com.example.tourez.data.response

import com.google.gson.annotations.SerializedName

data class GetUserResponse(

	@field:SerializedName("getusers")
	val getusers: Getusers? = null,

	@field:SerializedName("message")
	val message: String? = null
)

data class Getusers(

	@field:SerializedName("passwordChangedAt")
	val passwordChangedAt: Any? = null,

	@field:SerializedName("address")
	val address: Any? = null,

	@field:SerializedName("preference")
	val preference: String? = null,

	@field:SerializedName("latitude")
	val latitude: Any? = null,

	@field:SerializedName("mobile")
	val mobile: String? = null,

	@field:SerializedName("description")
	val description: String? = null,

	@field:SerializedName("profileImage")
	val profileImage: String? = null,

	@field:SerializedName("passwordResetToken")
	val passwordResetToken: Any? = null,

	@field:SerializedName("point")
	val point: Int? = null,

	@field:SerializedName("url")
	val url: String? = null,

	@field:SerializedName("passwordResetExpires")
	val passwordResetExpires: Any? = null,

	@field:SerializedName("createdAt")
	val createdAt: String? = null,

	@field:SerializedName("password")
	val password: String? = null,

	@field:SerializedName("tier")
	val tier: String? = null,

	@field:SerializedName("id")
	val id: Int? = null,

	@field:SerializedName("email")
	val email: String? = null,

	@field:SerializedName("username")
	val username: String? = null,

	@field:SerializedName("refreshToken")
	val refreshToken: Any? = null,

	@field:SerializedName("longitude")
	val longitude: Any? = null,

	@field:SerializedName("updatedAt")
	val updatedAt: String? = null
)
