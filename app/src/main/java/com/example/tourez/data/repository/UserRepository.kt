package com.example.tourez.data.repository

import androidx.lifecycle.liveData
import com.example.tourez.data.Result
import com.example.tourez.data.response.AddPostResponse
import com.example.tourez.data.response.GetDetailPostResponse
import com.example.tourez.data.response.GetPostResponse
import com.example.tourez.data.response.GetUserResponse
import com.example.tourez.data.response.LoginResponse
import com.example.tourez.data.response.RegisterResponse
import com.example.tourez.data.retrofit.ApiService
import com.example.tourez.pref.UserModel
import com.example.tourez.pref.UserPreference
import kotlinx.coroutines.flow.Flow
import okhttp3.MediaType.Companion.toMediaType
import okhttp3.MultipartBody
import okhttp3.RequestBody.Companion.asRequestBody
import okhttp3.RequestBody.Companion.toRequestBody
import java.io.File
import java.lang.Exception


class UserRepository private constructor(
    private val userPreference: UserPreference,
    private val apiService: ApiService
){
    fun getSession(): Flow<UserModel>{
        return userPreference.getSession()
    }

    suspend fun saveSession(userModel: UserModel){
        userPreference.saveSession(userModel)
    }

    suspend fun logout(){
        userPreference.logout()
    }

    fun register(username: String, email: String, password:String, mobile: String) = liveData<Result<RegisterResponse>>(){
        emit(Result.Loading)
        try {
            val response = apiService.register(username, email, password, mobile)
            emit(Result.Success(response))
        }catch (e: Exception){
            emit(Result.Error(e.message.toString()))
        }
    }

    fun login(email: String, password: String) = liveData<Result<LoginResponse>>(){
        emit(Result.Loading)
        try {
            val response = apiService.login(email, password)
            emit(Result.Success(response))
        }catch (e: Exception){
            emit(Result.Error(e.message.toString()))
        }
    }

    fun getDataUser(id: Int) = liveData<Result<GetUserResponse>> {
        emit(Result.Loading)
        try {
            val response = apiService.getUser(id)
            emit(Result.Success(response))
        }catch (e: Exception){
            emit(Result.Error(e.message.toString()))
        }
    }
    fun getRandomPost() = liveData<Result<GetPostResponse>>() {
        emit(Result.Loading)
        try {
            val response = apiService.getAllPost()
            emit(Result.Success(response))
        }catch (e: Exception){
            emit(Result.Error(e.message.toString()))
        }
    }

    fun getLikedPost() = liveData<Result<GetPostResponse>>() {
        emit(Result.Loading)
        try {
            val response = apiService.getLikePost()
            emit(Result.Success(response))
        }catch (e: Exception){
            emit(Result.Error(e.message.toString()))
        }
    }



    fun getDetailPost(id: String) = liveData<Result<GetDetailPostResponse>> {
        emit(Result.Loading)
        try {
            val response = apiService.getDetailPost(id)
            emit(Result.Success(response))
        }catch (e: Exception){
            emit(Result.Error(e.message.toString()))
        }
    }

    fun addPost(imgFile: File, judul: String, category: String, desc: String) = liveData<Result<AddPostResponse>> {
        emit(Result.Loading)
        val requestJudul = judul.toRequestBody("text/plain".toMediaType())
        val requestCategory = category.toRequestBody("text/plain".toMediaType())
        val requestDesc = desc.toRequestBody("text/plain".toMediaType())
        val requestImage = imgFile.asRequestBody("image/jpeg".toMediaType())
        val multipart = MultipartBody.Part.createFormData(
            "photo",
            imgFile.name,
            requestImage
        )
        try {
            val response = apiService.addPost(multipart, requestJudul, requestCategory, requestDesc)
            emit(Result.Success(response))
        }catch (e: Exception){
            emit(Result.Error(e.message.toString()))
        }
    }



    companion object{
        private const val TAG = "TourEZ"
        @Volatile
        private var instance: UserRepository? = null
        fun getInstance(
            userPreference: UserPreference,
            apiService: ApiService
        ):UserRepository =
            instance ?: synchronized(this){
                instance ?: UserRepository(userPreference, apiService)
            }.also { instance = it }
    }
}
