package com.example.tourez.view.menu.ui.profile

import android.content.Intent
import android.os.Bundle
import androidx.fragment.app.Fragment
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import androidx.appcompat.app.AlertDialog
import androidx.fragment.app.viewModels
import com.example.tourez.R
import com.example.tourez.data.ViewModelFactory
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

        return root
    }

}