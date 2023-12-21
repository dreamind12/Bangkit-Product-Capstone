package com.example.tourez.view.menu.ui.grid

import androidx.appcompat.app.AppCompatActivity
import android.os.Bundle
import androidx.activity.viewModels
import androidx.fragment.app.viewModels
import androidx.recyclerview.widget.GridLayoutManager
import androidx.recyclerview.widget.LinearLayoutManager
import com.example.tourez.data.Result
import com.example.tourez.data.ViewModelFactory
import com.example.tourez.data.response.DataItem
import com.example.tourez.databinding.ActivityGridPostRecomendationBinding
import com.example.tourez.databinding.ItemPostBinding
import com.example.tourez.view.menu.ui.home.HomeViewModel
import com.example.tourez.view.menu.ui.home.ListRecomentPostAdapter

class GridPostRecomendation : AppCompatActivity() {

    private val viewModel by viewModels<HomeViewModel> {
        ViewModelFactory.getInstance(this)
    }

    private lateinit var binding: ActivityGridPostRecomendationBinding
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        binding = ActivityGridPostRecomendationBinding.inflate(layoutInflater)
        setContentView(binding.root)

        val layoutManager = GridLayoutManager(this, 2)
        binding.rvGridPostRec.layoutManager = layoutManager

        getRecomendationPost()


    }

    private fun setRecPost(listRecPost: List<DataItem?>?){
        val adapter = ListGridPostAdapter()
        adapter.submitList(listRecPost)
        binding.rvGridPostRec.adapter = adapter
    }

    private fun getRecomendationPost(){
        viewModel.getSession().observe(this){
            if (it.isLogin){
                viewModel.getRandomPost().observe(this){ result ->
                    when(result){
                        is Result.Loading -> {
                            //show loading
                        }
                        is Result.Success -> {
                            setRecPost(result.data.data)
                        }
                        is Result.Error -> {
                            // kalo data ga ke load
                        }
                    }
                }
            }
        }
    }
}