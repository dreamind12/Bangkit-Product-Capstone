package com.example.tourez.view.menu.ui.home

import android.view.LayoutInflater
import android.view.ViewGroup
import androidx.recyclerview.widget.DiffUtil
import androidx.recyclerview.widget.ListAdapter
import androidx.recyclerview.widget.RecyclerView
import com.bumptech.glide.Glide
import com.example.tourez.data.response.DataItem
import com.example.tourez.databinding.ItemRandomBinding

class ListRandomPostAdapter:ListAdapter<DataItem, ListRandomPostAdapter.PostRandomViewHolder>(DIFF_CALLBACK) {

    override fun onCreateViewHolder(parent: ViewGroup, viewType: Int): PostRandomViewHolder {
        val binding = ItemRandomBinding.inflate(LayoutInflater.from(parent.context), parent, false)
        return PostRandomViewHolder(binding)
    }


    override fun onBindViewHolder(holder: ListRandomPostAdapter.PostRandomViewHolder, position: Int) {
        val randomPost = getItem(position)
        holder.bind(randomPost)
        holder.itemView.setOnClickListener {
            // ketika item di klik
        }
    }

    override fun getItemCount(): Int {
        val limit = 5
        return Math.min(10, limit)
    }

    inner class PostRandomViewHolder(val binding: ItemRandomBinding): RecyclerView.ViewHolder(binding.root) {
        fun bind(randomPost: DataItem){
            binding.apply {
                Glide.with(itemView)
                    .load(randomPost.url)
                    .centerCrop()
                    .into(ivRandomPost)
            }
        }
    }

    companion object{
        val DIFF_CALLBACK = object : DiffUtil.ItemCallback<DataItem>(){
            override fun areItemsTheSame(oldItem: DataItem, newItem: DataItem): Boolean {
                return  oldItem == newItem
            }

            override fun areContentsTheSame(oldItem: DataItem, newItem: DataItem): Boolean {
                return oldItem == newItem
            }
        }
    }
}