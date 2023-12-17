package com.example.tourez.data.retrofit

import com.example.tourez.data.response.GetAllUserResponse
import com.example.tourez.data.response.GetRandomPostResponse
import com.example.tourez.data.response.LoginResponse
import com.example.tourez.data.response.RegisterResponse
import retrofit2.http.Field
import retrofit2.http.FormUrlEncoded
import retrofit2.http.GET
import retrofit2.http.POST
import retrofit2.http.Path

interface ApiService {
    @FormUrlEncoded
    @POST("user/register")
    suspend fun register(
        @Field("username") username: String,
        @Field("email") email: String,
        @Field("password") password: String,
        @Field("mobile") mobile: String
    ): RegisterResponse

    @FormUrlEncoded
    @POST("user/login")
    suspend fun login(
        @Field("email") email: String,
        @Field("password") password: String
    ): LoginResponse

    @GET("user/get/{id}")
    suspend fun getUser(
        @Path("id") id: String
    ):GetAllUserResponse

    @GET("user/getAllPost")
    suspend fun getAllPost(

    ): GetRandomPostResponse

}