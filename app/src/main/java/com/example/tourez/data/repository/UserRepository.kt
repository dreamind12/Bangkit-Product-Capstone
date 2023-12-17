package com.example.tourez.data.repository

import androidx.lifecycle.liveData
import com.example.tourez.data.Result
import com.example.tourez.data.response.GetAllUserResponse
import com.example.tourez.data.response.GetRandomPostResponse
import com.example.tourez.data.response.LoginResponse
import com.example.tourez.data.response.RegisterResponse
import com.example.tourez.data.retrofit.ApiService
import com.example.tourez.pref.UserModel
import com.example.tourez.pref.UserPreference
import kotlinx.coroutines.flow.Flow
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

    fun getUser(id: String) = liveData<Result<GetAllUserResponse>> {
        emit(Result.Loading)
        try {
            val response = apiService.getUser(id)
            emit(Result.Success(response))
        }catch (e: Exception){
            emit(Result.Error(e.message.toString()))
        }
    }
    fun getRandomPost() = liveData<Result<GetRandomPostResponse>>() {
        emit(Result.Loading)
        try {
            val response = apiService.getAllPost()
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
