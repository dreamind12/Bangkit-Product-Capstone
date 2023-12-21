package com.example.tourez.view.menu.ui.journey

import android.content.Intent
import android.net.Uri
import android.os.Bundle
import android.util.Log
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.TextView
import android.widget.Toast
import androidx.activity.result.PickVisualMediaRequest
import androidx.activity.result.contract.ActivityResultContracts
import androidx.fragment.app.Fragment
import androidx.fragment.app.viewModels
import androidx.lifecycle.ViewModelProvider
import com.example.tourez.data.Result
import com.example.tourez.data.ViewModelFactory
import com.example.tourez.databinding.FragmentJourneyBinding
import com.example.tourez.view.menu.ui.profile.ProfileFragment

class JourneyFragment : Fragment() {

    private var _binding: FragmentJourneyBinding ?= null
    private var currentImageUri: Uri? = null

    private val viewModel by viewModels<JourneyViewModel> {
        ViewModelFactory.getInstance(requireActivity())
    }

    private val binding get() = _binding!!

    override fun onCreateView(
        inflater: LayoutInflater,
        container: ViewGroup?,
        savedInstanceState: Bundle?
    ): View {
        _binding = FragmentJourneyBinding.inflate(inflater, container, false)
        val root: View = binding.root

        binding.imgPost.setOnClickListener {
            startGallery()
        }

        // submit post
        binding.btnSubmit.setOnClickListener {
            addJourney()
        }

        return root
    }

    private fun addJourney(){
        currentImageUri?.let { uri ->
            val imageFile = uriToFIle(uri, requireActivity()).reduceFileImage()
            Log.d("Image File", "showImage: ${imageFile.path}")
            val judul = binding.postJudul.text.toString()
            val category = binding.postCategory.text.toString()
            val desc = binding.postDescription.text.toString()
            viewModel.addJourney(imageFile, judul, category, desc).observe(viewLifecycleOwner){
                if (it != null){
                    when(it){
                        is Result.Loading -> {
                            // loading
                        }
                        is Result.Success -> {
                            // loading dulu
                            val intent = Intent(requireActivity(), ProfileFragment::class.java)
                            intent.flags = Intent.FLAG_ACTIVITY_CLEAR_TASK
                            Toast.makeText(requireActivity(), "Postingan mu berhasil dibuat", Toast.LENGTH_SHORT).show()
                            startActivity(intent)
                        }
                        is Result.Error -> {
                            // loading dulu
                            Toast.makeText(requireActivity(), "yah postingan mu gagal dibuat", Toast.LENGTH_SHORT).show()
                        }
                    }
                }
            }
        }
    }

    private fun showImage(){
        currentImageUri?.let {
            Log.d("Image uri", "showImage: $it")
            binding.imgPost.setImageURI(it)
        }
    }

    private fun startGallery(){
        launcherGallery.launch(PickVisualMediaRequest(ActivityResultContracts.PickVisualMedia.ImageOnly))
    }

    private val launcherGallery = registerForActivityResult(
        ActivityResultContracts.PickVisualMedia()
    ){uri: Uri? ->
        if (uri != null){
            currentImageUri = uri
            showImage()
        }else{
            Log.d("Photo picker", "Ngga ada foto yang kamu pilih")
        }
    }


    override fun onDestroyView() {
        super.onDestroyView()
        _binding = null
    }
}