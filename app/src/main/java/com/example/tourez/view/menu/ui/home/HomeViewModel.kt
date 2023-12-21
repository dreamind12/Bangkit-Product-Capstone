package com.example.tourez.view.menu.ui.home

import androidx.lifecycle.LiveData
import androidx.lifecycle.MutableLiveData
import androidx.lifecycle.ViewModel
import androidx.lifecycle.asLiveData
import com.example.tourez.data.repository.UserRepository
import com.example.tourez.pref.UserModel

class HomeViewModel(private val userRepository: UserRepository) : ViewModel() {
    fun getSession(): LiveData<UserModel>{
        return userRepository.getSession().asLiveData()
    }
    fun getRandomPost() = userRepository.getRandomPost()

    fun getLikedPost() = userRepository.getLikedPost()


    fun getUser(id : Int) = userRepository.getDataUser(id)
}