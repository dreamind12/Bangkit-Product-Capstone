package com.example.tourez.data.di

import android.content.Context
import com.example.tourez.data.repository.UserRepository
import com.example.tourez.data.retrofit.ApiConfig
import com.example.tourez.pref.UserPreference
import com.example.tourez.pref.datastore
import kotlinx.coroutines.flow.first
import kotlinx.coroutines.runBlocking

object Injection {

    fun provideRepository(context: Context): UserRepository{
        val pref = UserPreference.getInstance(context.datastore)
        val user = runBlocking { pref.getSession().first() }
        val apiService = ApiConfig.getApiServices(user.token)
        return UserRepository.getInstance(pref, apiService)
    }
}