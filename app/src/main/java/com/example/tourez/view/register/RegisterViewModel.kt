package com.example.tourez.view.register

import androidx.lifecycle.LiveData
import androidx.lifecycle.MediatorLiveData
import androidx.lifecycle.ViewModel
import com.example.tourez.data.Result
import com.example.tourez.data.repository.UserRepository
import com.example.tourez.data.response.RegisterResponse

class RegisterViewModel(private val repository: UserRepository): ViewModel() {
    private val _registerResponse = MediatorLiveData<Result<RegisterResponse>>()
    val registerResponse : LiveData<Result<RegisterResponse>> = _registerResponse

    fun register(username: String, email: String, mobile: String, password: String){
        val liveData = repository.register(username, email, mobile, password)
        _registerResponse.addSource(liveData){ result ->
            _registerResponse.value = result
        }
    }
}