package com.example.tourez.view.register

import android.content.Intent
import androidx.appcompat.app.AppCompatActivity
import android.os.Bundle
import android.view.View
import android.widget.Toast
import androidx.appcompat.app.AlertDialog
import androidx.lifecycle.ViewModelProvider
import com.example.tourez.R
import com.example.tourez.data.Result
import com.example.tourez.data.ViewModelFactory
import com.example.tourez.databinding.ActivityRegisterBinding
import com.example.tourez.view.login.LoginActivity

class RegisterActivity : AppCompatActivity() {
    private lateinit var registerViewModel: RegisterViewModel
    private lateinit var binding: ActivityRegisterBinding

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        binding = ActivityRegisterBinding.inflate(layoutInflater)
        setContentView(binding.root)

        val factory : ViewModelFactory = ViewModelFactory.getInstance(this)
        registerViewModel = ViewModelProvider(this, factory)[RegisterViewModel::class.java]

        setupAction()

        registerViewModel.registerResponse.observe(this){
            when(it){
                is Result.Loading -> {
                    showLoading(true)
                }
                is Result.Success -> {
                    showLoading(false)
                    AlertDialog.Builder(this).apply {
                        setTitle(R.string.title_box)
                        setMessage(R.string.message_box)
                        setCancelable(false)
                        setPositiveButton(R.string.next_box){_, _ ->
                            val intent = Intent(context, LoginActivity::class.java)
                            startActivity(intent)
                            finish()
                        }
                        create()
                        show()
                    }
                }
                is Result.Error -> {
                    showLoading(false)
                }
            }
        }


        // link balik ke halaman login
        binding.tbLogin.setOnClickListener {
            Intent(applicationContext, LoginActivity::class.java).apply {
                startActivity(this)
            }
        }
    }

    // fungsi proses register
    private fun setupAction(){
        binding.button.setOnClickListener {
            binding.apply {
                if (inputEmail.error.isNullOrEmpty() && inputName.error.isNullOrEmpty()
                    && inputPassword.error.isNullOrEmpty() && inputPhone.error.isNullOrEmpty()){
                    val username = inputName.text.toString().trim()
                    val email = inputEmail.text.toString().trim()
                    val password = inputPassword.text.toString().trim()
                    val mobile = inputPhone.text.toString().trim()
                    registerViewModel.register(username, email, password, mobile)
                }
            }
        }
    }

    // fungsi menampilkan loading
    private fun showLoading(isLoading: Boolean) {
        binding.progressBar.visibility = if (isLoading) View.VISIBLE else View.INVISIBLE
    }

    private fun signUpFailed(){
        Toast.makeText(this, R.string.gagal_daftar, Toast.LENGTH_SHORT).show()
    }
}