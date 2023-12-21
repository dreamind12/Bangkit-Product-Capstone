package com.example.tourez.view.menu.ui.profile

import android.content.Intent
import android.os.Bundle
import androidx.fragment.app.Fragment
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import androidx.fragment.app.viewModels
import com.bumptech.glide.Glide
import com.example.tourez.R
import com.example.tourez.data.Result
import com.example.tourez.data.ViewModelFactory
import com.example.tourez.data.response.GetUserResponse
import com.example.tourez.databinding.FragmentProfileBinding
import com.example.tourez.view.login.LoginActivity
import com.google.android.material.dialog.MaterialAlertDialogBuilder

class ProfileFragment : Fragment() {
    private val viewModel by viewModels<ProfileViewModel> {
        ViewModelFactory.getInstance(requireActivity())
    }
    private lateinit var binding: FragmentProfileBinding
    override fun onCreateView(
        inflater: LayoutInflater, container: ViewGroup?,
        savedInstanceState: Bundle?
    ): View? {
        val binding = FragmentProfileBinding.inflate(layoutInflater)
        val root: View = binding.root

        binding.ivLogout.setOnClickListener {
            MaterialAlertDialogBuilder(requireActivity())
                .setMessage(resources.getString(R.string.message_logout))
                .setNegativeButton(resources.getString(R.string.say_no)) { dialog, which ->
                    // Respond to neutral button press
                }
                .setPositiveButton(resources.getString(R.string.say_yes)) { dialog, which ->
                    viewModel.logout()
                    val intent = Intent(activity, LoginActivity::class.java)
                    startActivity(intent)
                }
                .show()
        }

        viewModel.getSession().observe(requireActivity()){
            if (!it.isLogin){
                startActivity(Intent(requireContext(), LoginActivity::class.java))
            }
        }

        getDataUser(id)

        return root
    }

    fun setDataUser(dataUserResponse: GetUserResponse){
        binding.tvUsername.text = dataUserResponse.getusers?.username
        Glide.with(requireActivity())
            .load(dataUserResponse.getusers?.url)
            .into(binding.imageView)
        binding.tvMoto.text = dataUserResponse.getusers?.email
    }

    fun getDataUser(id: Int){
        viewModel.getDataUser(id).observe(viewLifecycleOwner){
            if (it != null){
                when(it){
                    is Result.Loading -> {
                        //loading
                    }
                    is Result.Success -> {
                        // loading stop
                        setDataUser(it.data)
                    }
                    is Result.Error -> {
                        // kalo error
                    }
                }
            }
        }
    }

}