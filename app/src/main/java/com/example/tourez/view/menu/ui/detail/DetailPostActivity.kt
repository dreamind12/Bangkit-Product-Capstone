package com.example.tourez.view.menu.ui.detail

import androidx.appcompat.app.AppCompatActivity
import android.os.Bundle
import android.widget.Toast
import androidx.activity.viewModels
import com.bumptech.glide.Glide
import com.bumptech.glide.load.engine.GlideException
import com.example.tourez.R
import com.example.tourez.data.Result
import com.example.tourez.data.ViewModelFactory
import com.example.tourez.data.response.GetDetailPostResponse
import com.example.tourez.databinding.ActivityDetailPostBinding

class DetailPostActivity : AppCompatActivity() {
    private lateinit var binding: ActivityDetailPostBinding
    private val viewModel by viewModels<DetailPostViewModel> {
        ViewModelFactory.getInstance(this)
    }


    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        binding = ActivityDetailPostBinding.inflate(layoutInflater)
        setContentView(binding.root)

        val id = intent.getStringExtra("ID").toString()
        getDetailPost(id)

    }

    private fun setDetail(detailPostResponse: GetDetailPostResponse){
        binding.tvJudul.text = detailPostResponse.post?.judul
        Glide.with(this)
            .load(detailPostResponse.post?.url)
            .into(binding.ivPost)
        binding.category.text = detailPostResponse.post?.category
        binding.tvDesc.text = detailPostResponse.post?.description
    }

    private fun getDetailPost(postId: String){
        viewModel.getDetailPost(postId).observe(this){
            if (it != null){
                when(it){
                    is Result.Loading -> {
                        // loading
                    }
                    is Result.Success -> {
                        // loading mati
                        setDetail(it.data)
                    }
                    is Result.Error -> {
                        // loading false
                        Toast.makeText(this, "Gagal memuat data", Toast.LENGTH_SHORT).show()
                    }
                }
            }
        }
    }
}