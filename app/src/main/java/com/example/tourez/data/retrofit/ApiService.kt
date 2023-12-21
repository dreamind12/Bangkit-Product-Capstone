package com.example.tourez.data.retrofit

import androidx.appcompat.widget.DialogTitle
import com.example.tourez.data.response.AddPostResponse
import com.example.tourez.data.response.GetDetailPostResponse
import com.example.tourez.data.response.GetPostResponse
import com.example.tourez.data.response.GetUserResponse
import com.example.tourez.data.response.LoginResponse
import com.example.tourez.data.response.RegisterResponse
import okhttp3.MultipartBody
import okhttp3.RequestBody
import retrofit2.http.Field
import retrofit2.http.FormUrlEncoded
import retrofit2.http.GET
import retrofit2.http.Multipart
import retrofit2.http.POST
import retrofit2.http.Part
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
        @Path("id") id: Int
    ): GetUserResponse

    @GET("user/getRandom")
    suspend fun getAllPost(): GetPostResponse

    @GET("user/getLikedPost")
    suspend fun getLikePost(): GetPostResponse

    @GET("user/getPost/{id}")
    suspend fun getDetailPost(
        @Path("id") id: String
    ): GetDetailPostResponse


    @Multipart
    @POST("user/post")
    suspend fun addPost(
        @Part file: MultipartBody.Part,
        @Part("title") title: RequestBody,
        @Part("category") category: RequestBody,
        @Part("description") description: RequestBody
    ):AddPostResponse


}