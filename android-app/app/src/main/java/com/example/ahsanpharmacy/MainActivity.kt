package com.example.ahsanpharmacy

import android.annotation.SuppressLint
import android.content.Context
import android.graphics.Bitmap
import android.os.Bundle
import android.print.PrintAttributes
import android.print.PrintManager
import android.view.ViewGroup
import android.webkit.JavascriptInterface
import android.webkit.WebChromeClient
import android.webkit.WebResourceRequest
import android.webkit.WebResourceResponse
import android.webkit.WebSettings
import android.webkit.WebView
import android.webkit.WebViewClient
import androidx.activity.ComponentActivity
import androidx.activity.OnBackPressedCallback

class MainActivity : ComponentActivity() {

    private lateinit var webView: WebView

    @SuppressLint("SetJavaScriptEnabled")
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)

        webView = WebView(this).apply {
            layoutParams = ViewGroup.LayoutParams(
                ViewGroup.LayoutParams.MATCH_PARENT,
                ViewGroup.LayoutParams.MATCH_PARENT
            )

            settings.apply {
                javaScriptEnabled = true
                domStorageEnabled = true
                databaseEnabled = true
                allowFileAccess = true
                allowContentAccess = true
                loadWithOverviewMode = true
                useWideViewPort = true
                builtInZoomControls = false
                displayZoomControls = false
                cacheMode = WebSettings.LOAD_DEFAULT
                mixedContentMode = WebSettings.MIXED_CONTENT_ALWAYS_ALLOW
            }

            // JavaScript Interface for Native Android Print
            addJavascriptInterface(WebAppInterface(this@MainActivity, this), "AndroidPrinter")

            webViewClient = object : WebViewClient() {
                override fun shouldOverrideUrlLoading(view: WebView?, request: WebResourceRequest?): Boolean {
                    return false
                }
            }

            webChromeClient = object : WebChromeClient() {
                override fun getDefaultVideoPoster(): Bitmap? {
                    return Bitmap.createBitmap(1, 1, Bitmap.Config.ARGB_8888)
                }
            }

            // Load the offline pharmacy POS app
            loadUrl("file:///android_asset/index.html")
        }

        setContentView(webView)

        // Handle native back button navigation
        onBackPressedDispatcher.addCallback(this, object : OnBackPressedCallback(true) {
            override fun handleOnBackPressed() {
                if (webView.canGoBack()) {
                    webView.goBack()
                } else {
                    finish()
                }
            }
        })
    }

    override fun onDestroy() {
        webView.destroy()
        super.onDestroy()
    }

    class WebAppInterface(private val context: Context, private val webView: WebView) {
        @JavascriptInterface
        fun printReceipt() {
            (context as? MainActivity)?.runOnUiThread {
                val printManager = context.getSystemService(Context.PRINT_SERVICE) as? PrintManager
                val printAdapter = webView.createPrintDocumentAdapter("AHSAN_Pharmacy_Receipt")
                val jobName = "AHSAN Pharmacy Invoice " + System.currentTimeMillis()
                printManager?.print(jobName, printAdapter, PrintAttributes.Builder().build())
            }
        }
    }
}
