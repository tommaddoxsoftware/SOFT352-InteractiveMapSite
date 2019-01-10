

QUnit.test("Test Map Init works on the intended div", function(assert){
    initMap();

    assert.equal($('#livemap').css('position'), "relative");
});

QUnit.test("Test Map height", function(assert){
    assert.equal($('#livemap').css('height'), "600px");
});

QUnit.test("Test Connection to Server", function(assert){
    var response;
    var done = assert.async();

    $.ajax({
        url: "http://localhost:9000/debug",
        type: "POST",
        success: function(result) {
            response = JSON.parse(result);
        }
    });

    setTimeout(function() {
        assert.equal(response.status, "success");
        done();
    });    
});
