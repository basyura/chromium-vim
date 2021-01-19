package main

import (
	"bytes"
	"fmt"
	"net/http"
	"time"
)

func main() {
	http.HandleFunc("/", func(w http.ResponseWriter, r *http.Request) {
		bufbody := new(bytes.Buffer)
		bufbody.ReadFrom(r.Body)

		fmt.Println(time.Now().Format("15:04:05.000"), ":", string(bufbody.Bytes()))

		w.Write([]byte("OK"))
	})

	fmt.Println("listen: 8000")
	http.ListenAndServe("localhost:8000", nil)
}
