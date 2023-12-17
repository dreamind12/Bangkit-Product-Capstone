package com.example.tourez.data.response

import com.google.gson.annotations.SerializedName

data class GetRandomPostResponse(

	@field:SerializedName("data")
	val data: List<DataItem?>? = null,

	@field:SerializedName("message")
	val message: String? = null
)

data class User(

	@field:SerializedName("profileImage")
	val profileImage: String? = null,

	@field:SerializedName("url")
	val url: String? = null,

	@field:SerializedName("username")
	val username: String? = null
)

data class DataItem(

	@field:SerializedName("createdAt")
	val createdAt: String? = null,

	@field:SerializedName("User")
	val user: User? = null,

	@field:SerializedName("coverImage")
	val coverImage: String? = null,

	@field:SerializedName("description")
	val description: String? = null,

	@field:SerializedName("id")
	val id: Int? = null,

	@field:SerializedName("totalLikes")
	val totalLikes: Int? = null,

	@field:SerializedName("postId")
	val postId: String? = null,

	@field:SerializedName("judul")
	val judul: String? = null,

	@field:SerializedName("category")
	val category: String? = null,

	@field:SerializedName("userId")
	val userId: Int? = null,

	@field:SerializedName("url")
	val url: String? = null,

	@field:SerializedName("updatedAt")
	val updatedAt: String? = null
)
