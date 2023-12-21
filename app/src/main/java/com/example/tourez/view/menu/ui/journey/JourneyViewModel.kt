package com.example.tourez.view.menu.ui.journey

import androidx.lifecycle.LiveData
import androidx.lifecycle.MutableLiveData
import androidx.lifecycle.ViewModel
import com.example.tourez.data.repository.UserRepository
import java.io.File

class JourneyViewModel(private val repository: UserRepository) : ViewModel() {
    fun addJourney(imgFile: File, judul:String, category:String, description:String)  =
        repository.addPost(imgFile, judul, category, description)
}