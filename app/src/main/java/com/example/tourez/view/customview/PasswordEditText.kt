package com.example.tourez.view.customview

import android.content.Context
import android.text.Editable
import android.text.TextWatcher
import android.util.AttributeSet
import androidx.appcompat.widget.AppCompatEditText

class PasswordEditText: AppCompatEditText {
    constructor(context: Context) :super(context){
        init()
    }

    constructor(context: Context, attrs: AttributeSet):super(context, attrs){
        init()
    }

    constructor(context: Context, attrs: AttributeSet, defStyleAttr: Int): super(context, attrs, defStyleAttr){
        init()
    }


    private fun init(){
        addTextChangedListener(object : TextWatcher {
            override fun beforeTextChanged(p0: CharSequence?, p1: Int, p2: Int, p3: Int) {
                // no task
            }

            override fun onTextChanged(s: CharSequence?, start: Int, before: Int, count: Int) {
                if (s.toString().length < 8){
                    setError("Password mu minimal 8 karakter", null)
                }else{
                    error = null
                }
            }

            override fun afterTextChanged(p0: Editable?) {
                // not task
            }

        })
    }
}