package com.example.tourez.view.login

import android.content.Intent
import androidx.appcompat.app.AppCompatActivity
import android.os.Bundle
import android.view.View
import androidx.appcompat.app.AlertDialog
import androidx.lifecycle.ViewModelProvider
import com.example.tourez.data.Result
import com.example.tourez.data.ViewModelFactory
import com.example.tourez.databinding.ActivityLoginBinding
import com.example.tourez.pref.UserModel
import com.example.tourez.view.menu.ui.MainMenuActivity
import com.example.tourez.view.register.RegisterActivity

class LoginActivity : AppCompatActivity() {
    private lateinit var binding: ActivityLoginBinding
    private lateinit var viewModel: LoginViewModel

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        binding = ActivityLoginBinding.inflate(layoutInflater)
        setContentView(binding.root)

        val factory : ViewModelFactory = ViewModelFactory.getInstance(this)
        viewModel = ViewModelProvider(this, factory)[LoginViewModel::class.java]

        setupAction()

        viewModel.loginResponse.observe(this){
            when(it){
                is Result.Loading -> { showLoading(true) }
                is Result.Success -> {
                    showLoading(false)
                    val email = binding.emailEditText.text.toString()
                    viewModel.saveSession(UserModel(email, it.data?.token.toString()))
                    AlertDialog.Builder(this).apply {
                        setTitle("Yeayy")
                        setMessage("kamu berhasil login")
                        setCancelable(false)
                        setPositiveButton("Next"){_,_ ->
                            val intent = Intent(this@LoginActivity, MainMenuActivity::class.java)
                            intent.flags = Intent.FLAG_ACTIVITY_CLEAR_TASK or Intent.FLAG_ACTIVITY_NEW_TASK
                            startActivity(intent)
                            finish()
                        }
                        create()
                        show()
                    }
                }

                is Result.Error -> {
                    AlertDialog.Builder(this).apply {
                        setTitle("Gagal login")
                        setMessage("pastiin email dan password kamu bener ya")
                        setCancelable(true)
                        create()
                        show()
                    }
                    showLoading(false)
                }
            }
        }

        binding.tbRegister.setOnClickListener {
            val intent = Intent(this, RegisterActivity::class.java)
            startActivity(intent)
        }
    }

    private fun setupAction(){
        binding.button.setOnClickListener {
            binding.apply {
                if (emailEditText.error.isNullOrEmpty() && passwordEditText.error.isNullOrEmpty()){
                    val email = emailEditText.text.toString().trim()
                    val password = passwordEditText.text.toString().trim()
                    viewModel.login(email, password)
                }
            }
        }
    }

    private fun showLoading(isLoading : Boolean) {
        binding.progressBar.visibility = if (isLoading) View.VISIBLE else View.INVISIBLE
    }
}