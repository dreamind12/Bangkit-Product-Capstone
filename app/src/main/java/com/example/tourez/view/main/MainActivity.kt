package com.example.tourez.view.main

import android.content.Intent
import androidx.appcompat.app.AppCompatActivity
import android.os.Bundle
import android.view.View
import android.view.ViewGroup.LayoutParams.WRAP_CONTENT
import android.widget.ImageView
import android.widget.LinearLayout
import android.widget.Toast
import androidx.core.content.ContextCompat
import androidx.core.view.get
import androidx.viewpager2.widget.ViewPager2.OnPageChangeCallback
import com.example.tourez.R
import com.example.tourez.adapter.IntroSlideAdapter
import com.example.tourez.data.IntroSlide
import com.example.tourez.databinding.ActivityMainBinding
import com.example.tourez.view.login.LoginActivity
import com.example.tourez.view.register.RegisterActivity

class MainActivity : AppCompatActivity() {
    private lateinit var binding: ActivityMainBinding


    private val introSlideAdapter = IntroSlideAdapter(
        listOf(
            IntroSlide(
                R.drawable.headline1,
                R.drawable.background1,
                "Start Your Journey"
            ),
            IntroSlide(
                R.drawable.headline1,
                R.drawable.background2,
                "Explored the Unexplored"
            ),
            IntroSlide(
                R.drawable.headline1,
                R.drawable.background3,
                "Crafting Memories, One Trip at a Time"
            ),
            IntroSlide(
                R.drawable.headline1,
                R.drawable.background4,
                "Your Adventure Begins Here"
            )
        )
    )

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        binding = ActivityMainBinding.inflate(layoutInflater)
        setContentView(binding.root)
        binding.viewPager.adapter = introSlideAdapter



        val next = introSlideAdapter.itemCount
        binding.button.setOnClickListener {
            var position = binding.viewPager.currentItem
            if(position + 1 < next){
                binding.viewPager.currentItem = position + 1
            }else{
                Intent(applicationContext, RegisterActivity::class.java).also {
                    startActivity(it)
                }
            }
        }

        binding.buttonLogin.setOnClickListener {
            val intent = Intent(this, LoginActivity::class.java)
            startActivity(intent)
        }

        setIndicatorSlide()
        setCurrentIndicator(0)

        binding.viewPager.registerOnPageChangeCallback(object: OnPageChangeCallback(){
            override fun onPageSelected(position: Int) {
                super.onPageSelected(position)
                setCurrentIndicator(position)
                if(position == next - 1){
                    binding.button.text = "Register"
                    binding.buttonLogin.visibility = View.VISIBLE
                }else{
                    binding.button.text = "Next"
                    binding.buttonLogin.visibility = View.GONE
                }
            }
        })
    }

    private fun setIndicatorSlide(){
        val indicatiors = arrayOfNulls<ImageView>(introSlideAdapter.itemCount)
        val layoutParams: LinearLayout.LayoutParams =
            LinearLayout.LayoutParams(WRAP_CONTENT, WRAP_CONTENT)
        layoutParams.setMargins(8, 0 , 8, 0)
        for (i in indicatiors.indices){
            indicatiors[i] = ImageView(applicationContext)
            indicatiors[i].apply {
                this?.setImageDrawable(
                    ContextCompat.getDrawable(
                        applicationContext,
                        R.drawable.indicatior_active
                    )
                )
                this?.layoutParams = layoutParams
            }
            binding.indicatorSlide.addView(indicatiors[i])
        }
    }

    private fun setCurrentIndicator(index: Int){
        val childCount = binding.indicatorSlide.childCount
        for (i in 0 until childCount){
            val imageView = binding.indicatorSlide[i] as ImageView
            if (i == index){
                imageView.setImageDrawable(
                    ContextCompat.getDrawable(
                        applicationContext,
                        R.drawable.indicator_inactive
                    )
                )
            }else{
                imageView.setImageDrawable(
                    ContextCompat.getDrawable(
                        applicationContext,
                        R.drawable.indicatior_active
                    )
                )
            }
        }
    }
}