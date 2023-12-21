package com.example.tourez.view.menu.ui.home

import android.content.Intent
import android.os.Bundle
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.TextView
import android.widget.Toast
import androidx.appcompat.app.AlertDialog
import androidx.fragment.app.Fragment
import androidx.fragment.app.viewModels
import androidx.lifecycle.ViewModelProvider
import androidx.recyclerview.widget.GridLayoutManager
import androidx.recyclerview.widget.LinearLayoutManager
import com.bumptech.glide.Glide
import com.example.tourez.data.Result
import com.example.tourez.data.ViewModelFactory
import com.example.tourez.data.response.DataItem
import com.example.tourez.data.response.GetUserResponse
import com.example.tourez.data.response.Getusers
import com.example.tourez.data.response.User
import com.example.tourez.databinding.FragmentHomeBinding
import com.example.tourez.view.login.LoginActivity
import com.example.tourez.view.menu.ui.grid.GridPostRecomendation
import com.example.tourez.view.menu.ui.profile.ProfileFragment
import java.util.Arrays

class HomeFragment : Fragment() {

    private val homeViewModel by viewModels<HomeViewModel> {
        ViewModelFactory.getInstance(requireActivity())
    }
    private var _binding: FragmentHomeBinding? = null
    private val binding get() = _binding!!

    override fun onCreateView(
        inflater: LayoutInflater,
        container: ViewGroup?,
        savedInstanceState: Bundle?
    ): View {

        _binding = FragmentHomeBinding.inflate(inflater, container, false)
        val root: View = binding.root

        val layoutManager = LinearLayoutManager(requireActivity(), LinearLayoutManager.HORIZONTAL, false)
        binding.randomPost.layoutManager = layoutManager

        val layoutManager2 = LinearLayoutManager(requireActivity(), LinearLayoutManager.HORIZONTAL, false)
        binding.rvRecomendation.layoutManager = layoutManager2

        val layoutManager3 = LinearLayoutManager(requireActivity(), LinearLayoutManager.HORIZONTAL, false)
        binding.rvTopPost.layoutManager = layoutManager3

        getRandomPost()
        getRecomendationPost()
        getTopPost()

        //showPreference()

        binding.allRecomendation.setOnClickListener {
            val intent = Intent(requireActivity(), GridPostRecomendation::class.java)
            startActivity(intent)
        }

        binding.allTopPost.setOnClickListener {
            val intent = Intent(requireActivity(), GridPostRecomendation::class.java)
            startActivity(intent)
        }


        homeViewModel.getSession().observe(requireActivity()){
            if (!it.isLogin){
                startActivity(Intent(requireContext(), LoginActivity::class.java))
            }
        }

        return root
    }


    fun showPreference(){
        val items = arrayOf("Wisata", "Date", "Hidden Gem", "Alam", "Museum")
        val selectedList = ArrayList<Int>()
        val builder = AlertDialog.Builder(requireContext())

        builder.setTitle("Pilih kategori yang kamu mau")
        builder.setMultiChoiceItems(items, null
        ) { dialog, which, isChecked ->
            if (isChecked) {
                selectedList.add(which)
            } else if (selectedList.contains(which)) {
                selectedList.remove(Integer.valueOf(which))
            }
        }

        builder.setPositiveButton("Pilih") { dialogInterface, i ->
            val selectedStrings = ArrayList<String>()

            for (j in selectedList.indices) {
                selectedStrings.add(items[selectedList[j]])
            }

            Toast.makeText(context, "Items selected are: " + Arrays.toString(selectedStrings.toTypedArray()), Toast.LENGTH_SHORT).show()
        }

        builder.show()

    }

    private fun setUser(dataUserResponse: GetUserResponse){
        Glide.with(this)
            .load(dataUserResponse.getusers?.url)
            .into(binding.ivProfile)
    }

    private fun setRecPost(listRecPost: List<DataItem?>?){
        val adapter = ListRecomentPostAdapter()
        adapter.submitList(listRecPost)
        binding.rvRecomendation.adapter = adapter
    }

    private fun getRecomendationPost(){
        homeViewModel.getSession().observe(viewLifecycleOwner){
            if (it.isLogin){
                homeViewModel.getRandomPost().observe(viewLifecycleOwner){ result ->
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
    private fun setTopPost(listTopPost: List<DataItem?>?){
        val adapter = ListRecomentPostAdapter()
        adapter.submitList(listTopPost)
        binding.rvTopPost.adapter = adapter
    }

    private fun getTopPost(){
        homeViewModel.getSession().observe(viewLifecycleOwner){
            if (it.isLogin){
                homeViewModel.getLikedPost().observe(viewLifecycleOwner){ result ->
                    when(result){
                        is Result.Loading -> {
                            //show loading
                        }
                        is Result.Success -> {
                            setTopPost(result.data.data)
                        }
                        is Result.Error -> {
                            // kalo data ga ke load
                        }
                    }
                }
            }
        }
    }

    private fun setRandomPost(listRandomPost: List<DataItem?>?){
        val adapter = ListRandomPostAdapter()
        adapter.submitList(listRandomPost)
        binding.randomPost.adapter = adapter
    }

    private fun getRandomPost(){
        homeViewModel.getSession().observe(viewLifecycleOwner){
            if (it.isLogin){
                homeViewModel.getRandomPost().observe(viewLifecycleOwner){ result ->
                    when(result){
                        is Result.Loading -> {
                            //show loading
                        }
                        is Result.Success -> {
                            setRandomPost(result.data.data)
                        }
                        is Result.Error -> {
                            // kalo data ga ke load
                        }
                    }
                }
            }
        }
    }
    override fun onDestroyView() {
        super.onDestroyView()
        _binding = null
    }
}