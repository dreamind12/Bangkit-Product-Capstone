package com.example.tourez.data.response

import com.google.gson.annotations.SerializedName

data class GetDetailPostResponse(

	@field:SerializedName("post")
	val post: Post? = null,

	@field:SerializedName("steps")
	val steps: List<StepsItem?>? = null
)

data class Post(

	@field:SerializedName("createdAt")
	val createdAt: String? = null,

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

data class StepsItem(

	@field:SerializedName("image")
	val image: String? = null,

	@field:SerializedName("address")
	val address: Any? = null,

	@field:SerializedName("description")
	val description: String? = null,

	@field:SerializedName("postId")
	val postId: String? = null,

	@field:SerializedName("judul")
	val judul: String? = null,

	@field:SerializedName("url")
	val url: String? = null
)
