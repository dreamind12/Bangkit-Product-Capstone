package com.example.tourez.data.retrofit

import com.example.tourez.data.response.RegisterResponse
import retrofit2.http.Field
import retrofit2.http.FormUrlEncoded
import retrofit2.http.POST

interface ApiService {
    @FormUrlEncoded
    @POST("user/register")
    suspend fun register(
        @Field("username") username: String,
        @Field("email") email: String,
        @Field("mobile") mobile: String,
        @Field("password") password: String
    ): RegisterResponse
}