package com.example.tourez.view.menu.ui.grid

import android.content.Intent
import android.util.Log
import android.view.LayoutInflater
import android.view.ViewGroup
import android.widget.Toast
import androidx.recyclerview.widget.DiffUtil
import androidx.recyclerview.widget.ListAdapter
import androidx.recyclerview.widget.RecyclerView
import com.bumptech.glide.Glide
import com.example.tourez.data.response.DataItem
import com.example.tourez.databinding.ItemPostBinding
import com.example.tourez.view.menu.ui.detail.DetailPostActivity

class ListGridPostAdapter:ListAdapter<DataItem, ListGridPostAdapter.ListRecPostViewHolder>(DIFF_CALLBACK) {

    inner class ListRecPostViewHolder(private val binding: ItemPostBinding): RecyclerView.ViewHolder(binding.root) {
        fun bind(rekomenPost: DataItem){
            binding.apply {
                Glide.with(itemView)
                    .load(rekomenPost.url)
                    .centerCrop()
                    .into(imgPost)
            }
            binding.tvTitle.text = rekomenPost.judul

            Glide.with(itemView)
                .load(rekomenPost.user?.profileImage)
                .centerCrop()
                .into(binding.ciUser)
            binding.tvName.text = rekomenPost.user?.username
        }
    }

    override fun onCreateViewHolder(parent: ViewGroup, viewType: Int): ListRecPostViewHolder {
        val binding = ItemPostBinding.inflate(LayoutInflater.from(parent.context), parent, false)
        return ListRecPostViewHolder(binding)
    }

    override fun onBindViewHolder(holder: ListRecPostViewHolder, position: Int) {
        val rekomenPost = getItem(position)
        holder.bind(rekomenPost)
        holder.itemView.setOnClickListener {
//            val intent = Intent(holder.itemView.context, DetailPostActivity::class.java)
//            intent.putExtra("ID", rekomenPost.postId)
            Log.d("Test", "Item test")
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