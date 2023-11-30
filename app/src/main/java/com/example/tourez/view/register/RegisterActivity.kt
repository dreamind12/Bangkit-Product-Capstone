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

        binding.button.setOnClickListener {
            binding.apply {
                val username = binding.edtName.editText.toString().trim()
                val email = binding.edtEmail.editText.toString().trim()
                val mobile = binding.edtTelp.editText.toString().trim()
                val password = binding.edtPassword.editText.toString().trim()
                registerViewModel.register(username, email, mobile, password)
            }
        }

        // link balik ke halaman login
        binding.tbLogin.setOnClickListener {
            Intent(applicationContext, LoginActivity::class.java).apply {
                startActivity(this)
            }
        }
    }

    private fun showLoading(isLoading: Boolean) {
        binding.progressBar.visibility = if (isLoading) View.VISIBLE else View.INVISIBLE
    }

    private fun signUpFailed(){
        Toast.makeText(this, R.string.gagal_daftar, Toast.LENGTH_SHORT).show()
    }
}