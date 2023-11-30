package com.example.tourez.adapter

import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import androidx.recyclerview.widget.RecyclerView
import com.example.tourez.R
import com.example.tourez.data.IntroSlide
import com.example.tourez.databinding.ItemSliderBinding

class IntroSlideAdapter(private val introSlide: List<IntroSlide>):
    RecyclerView.Adapter<IntroSlideAdapter.IntroSlideViewHolder>() {

    inner class IntroSlideViewHolder(val binding: ItemSliderBinding): RecyclerView.ViewHolder(binding.root){
        fun bind(item: IntroSlide){
            binding.ivHeadline.setImageResource(item.headline)
            binding.imgSlider.setImageResource(item.image)
            binding.tvDescription.text = item.description
        }
    }

    override fun onCreateViewHolder(parent: ViewGroup, viewType: Int): IntroSlideViewHolder {
        val binding = ItemSliderBinding.inflate(LayoutInflater.from(parent.context), parent, false)
        return IntroSlideViewHolder(binding)
    }

    override fun getItemCount(): Int {
        return introSlide.size
    }

    override fun onBindViewHolder(holder: IntroSlideViewHolder, position: Int) {
        holder.bind(introSlide[position])
    }
}