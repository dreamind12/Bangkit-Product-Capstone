package com.example.tourez.data.repository

import androidx.lifecycle.liveData
import com.example.tourez.data.Result
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
    suspend fun getSession(): Flow<UserModel>{
        return userPreference.getSession()
    }

    suspend fun saveSession(userModel: UserModel){
        userPreference.saveSession(userModel)
    }

    suspend fun logout(){
        userPreference.logout()
    }

    fun register(username: String, email: String, mobile: String, password:String) = liveData<Result<RegisterResponse>>(){
        emit(Result.Loading)
        try {
            val response = apiService.register(username, email, mobile, password)
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
