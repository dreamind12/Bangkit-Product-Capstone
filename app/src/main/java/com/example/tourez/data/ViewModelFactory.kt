package com.example.tourez.data

import android.content.Context
import androidx.lifecycle.ViewModel
import androidx.lifecycle.ViewModelProvider
import com.example.tourez.data.di.Injection
import com.example.tourez.data.repository.UserRepository
import com.example.tourez.view.login.LoginViewModel
import com.example.tourez.view.menu.ui.detail.DetailPostViewModel
import com.example.tourez.view.menu.ui.home.HomeViewModel
import com.example.tourez.view.menu.ui.journey.JourneyViewModel
import com.example.tourez.view.menu.ui.profile.ProfileViewModel
import com.example.tourez.view.register.RegisterViewModel

class ViewModelFactory(private val repository: UserRepository): ViewModelProvider.NewInstanceFactory() {
    @Suppress("UNCHECKED_CAST")
    override fun <T : ViewModel> create(modelClass: Class<T>): T {
        return when{
            modelClass.isAssignableFrom(RegisterViewModel::class.java) -> {
                RegisterViewModel(repository) as T
            }
            modelClass.isAssignableFrom(LoginViewModel::class.java) -> {
                LoginViewModel(repository) as T
            }
            modelClass.isAssignableFrom(HomeViewModel::class.java) -> {
                HomeViewModel(repository) as T
            }
            modelClass.isAssignableFrom(ProfileViewModel::class.java) -> {
                ProfileViewModel(repository) as T
            }
            modelClass.isAssignableFrom(JourneyViewModel::class.java) -> {
                JourneyViewModel(repository) as T
            }
            modelClass.isAssignableFrom(DetailPostViewModel::class.java) -> {
                DetailPostViewModel(repository) as T
            }
            else -> throw IllegalArgumentException("Unknown ViewModel Class")
        }
    }

    companion object{
        @Volatile
        private var INSTANCE : ViewModelFactory ? = null
        @JvmStatic
        fun getInstance(context: Context): ViewModelFactory {
            if (INSTANCE == null){
                synchronized(ViewModelFactory::class.java){
                    INSTANCE = ViewModelFactory(Injection.provideRepository(context))
                }
            }
            return INSTANCE as ViewModelFactory
        }
    }
}