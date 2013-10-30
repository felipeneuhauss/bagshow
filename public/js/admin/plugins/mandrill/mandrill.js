/**
 * Library to send mail by mandrill.
 * To each app is necessary set the attr.key, depending owner
 * @dependences jquery lib
 * @type {{attr: {key: string, message: {html: string, text: string, subject: string, from_email: string, from_name: string, to: Array, headers: {Reply-To: string}, important: boolean, track_opens: null, track_clicks: null, auto_text: null, auto_html: null, inline_css: null, url_strip_qs: null, preserve_recipients: null, bcc_address: string, tracking_domain: null, signing_domain: null, merge: boolean, global_merge_vars: Array, merge_vars: Array, tags: Array, google_analytics_domains: Array, google_analytics_campaign: string, metadata: {website: string}, recipient_metadata: Array, attachments: Array, images: Array}, async: boolean, ip_pool: string}, send: Function, setFrom: Function, setTo: Function}}
 * @version: 1.0
 * @author: felipe.neuhauss@gmail.com
 */
var mandrill = {
    "attr" : {
        "key": "_nxp3fDElOsJo4HQ-ILjZg",
        "message": {
            "html": "",
            "text": "",
            "subject": "",
            "from_email": "contato@izie.com.br",
            "from_name": "Contato Izie",
            "to": [
            {
                "email": "",
                "name": ""
            }
            ],
            "headers": {
                "Reply-To": "contato@izie.com.br"
            },
            "important": false,
                "track_opens": null,
                "track_clicks": null,
                "auto_text": null,
                "auto_html": null,
                "inline_css": null,
                "url_strip_qs": null,
                "preserve_recipients": null,
                "bcc_address": "contato@izie.com.br",
                "tracking_domain": null,
                "signing_domain": null,
                "merge": true,
                "global_merge_vars": [
                {
                    "name": "merge1",
                    "content": "merge1 content"
                }
            ],
            "merge_vars": [
            {
                "rcpt": "recipient.email@example.com",
                "vars": [
                    {
                        "name": "merge2",
                        "content": "merge2 content"
                    }
                ]
            }
            ],
            "tags": [
            "password-resets"
            ],
            "google_analytics_domains": [
            "example.com"
            ],
            "google_analytics_campaign": "message.from_email@example.com",
            "metadata": {
            "website": "www.example.com"
            },
            "recipient_metadata": [
                {
                    "rcpt": "recipient.email@example.com",
                    "values": {
                        "user_id": 123456
                    }
                }
            ],
            "attachments": [
            {
//                    "type": "text/plain",
//                    "name": "myfile.txt",
//                    "content": "ZXhhbXBsZSBmaWxl"
            }
            ],
            "images": [
                {
//                        "type": "image/png",
//                        "name": "IMAGECID",
//                        "content": "ZXhhbXBsZSBmaWxl"
                }
            ]
            },
        "async": false,
        "ip_pool": "Main Pool"
    },
    "send" : function()
    {
        $.ajax({
            url: 'https://mandrillapp.com/api/1.0/messages/send.json',
            dataType: 'json',
            data: this.attr,
            async: false,
            beforeSend:function(){
            },
            success: function(data){
                return true;
            },
            type: 'post'
        });
    },
    /**
     * Set from informations
     * @param $name
     * @param $email
     */
    setFrom : function($name, $email)
    {
        this.attr.message.from_name = $name;
        this.attr.message.from_email = $email;
    },
    /**
     * Set recipientes
     * [{@param $name
     * @param $email}]
     */
    addTo: function($recipients)
    {
        this.attr.message.to = $recipients;
    },
    /**
     * Set HTMl body
     * @param $html
     */
    setHtmlBody: function($html)
    {
        this.attr.message.html = $html;
    },
    /**
     * Set text body
     * @param $text
     */
    setTextBody: function($text)
    {
        this.attr.message.text = $text;
    },
    /**
     * Set subject
     * @param $text
     */
    setSubject: function($subject)
    {
        this.attr.message.subject = $subject;
    },
    /**
     * Set Attachments body
     * @param $html
     */
    setAttachments: function($attachments)
    {
        this.attr.message.attachments = $attachments;
    }
};
