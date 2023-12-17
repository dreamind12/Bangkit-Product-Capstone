package com.example.tourez.view.login

import androidx.lifecycle.LiveData
import androidx.lifecycle.MediatorLiveData
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.example.tourez.data.Result
import com.example.tourez.data.repository.UserRepository
import com.example.tourez.data.response.LoginResponse
import com.example.tourez.pref.UserModel
import kotlinx.coroutines.launch

class LoginViewModel(private val userRepository: UserRepository): ViewModel() {
    private val _loginResponse = MediatorLiveData<Result<LoginResponse>>()
    val loginResponse : LiveData<Result<LoginResponse>> = _loginResponse

    fun login(email: String, password: String){
        val data = userRepository.login(email, password)
        _loginResponse.addSource(data){
            _loginResponse.value = it
        }
    }

    fun saveSession(user: UserModel){
        viewModelScope.launch {
            userRepository.saveSession(user)
        }
    }
}