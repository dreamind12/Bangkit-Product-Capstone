package com.example.tourez.data.response

data class RegisterResponse(
	val createUser: CreateUser? = null,
	val message: String? = null
)

data class CreateUser(
	val createdAt: String? = null,
	val password: String? = null,
	val tier: String? = null,
	val mobile: String? = null,
	val id: Int? = null,
	val point: Int? = null,
	val email: String? = null,
	val username: String? = null,
	val updatedAt: String? = null
)

