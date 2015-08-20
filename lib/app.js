// Define ones data model
var model = {
    auction: {
        counter : 0,
        items : []
    },
    controller: {
        bid : function(){
            // Increment the counter
            // Call the shim method set, in the absence of Getters and Setters
            model.auction.set( 'counter', model.auction.get('counter') + 1 );
            // Insert a record into an Array
            // Call the shim method Object.push, in the absence of Getters and Setters
            model.auction.push( 'items', {
                done : true,
                time : (new Date())
            } );
        }
    }
};

var view = rivets.bind( document.querySelector('#auction'), model );
