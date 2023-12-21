package com.example.tourez.view.menu.ui.detail

import androidx.lifecycle.ViewModel
import com.example.tourez.data.repository.UserRepository

class DetailPostViewModel(private val repository :UserRepository): ViewModel() {
    fun getDetailPost(id: String) = repository.getDetailPost(id)
}