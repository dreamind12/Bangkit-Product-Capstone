package com.example.tourez.view.menu.ui.profile

import androidx.lifecycle.LiveData
import androidx.lifecycle.ViewModel
import androidx.lifecycle.asLiveData
import androidx.lifecycle.viewModelScope
import com.example.tourez.data.repository.UserRepository
import com.example.tourez.pref.UserModel
import kotlinx.coroutines.launch

class ProfileViewModel(private val repository: UserRepository): ViewModel() {
    fun getSession(): LiveData<UserModel>{
        return repository.getSession().asLiveData()
    }

    fun getDataUser(id: Int) = repository.getDataUser(id)

    fun logout(){
        viewModelScope.launch {
            repository.logout()
        }
    }
}