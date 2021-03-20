import React, { Component } from 'react';
import {
    Text, View, ScrollView, FlatList,
    Modal, Button, StyleSheet, Alert, PanResponder
} from 'react-native';
import { Card, Icon, Rating, Input, Badge } from 'react-native-elements';
import { connect } from 'react-redux';
import { baseUrl } from '../shared/baseUrl';
import { postFavorite, postComment } from '../redux/ActionCreators';
import * as Animatable from 'react-native-animatable';

const mapStateToProps = state => {
    return {
        campsites: state.campsites,
        comments: state.comments,
        favorites: state.favorites
    };
};

const mapDispatchToProps = {
    postFavorite: campsiteId => (postFavorite(campsiteId)),
    postComment: (comment) => postComment(comment),

};

function RenderCampsite(props) {
    
    const { campsite } = props;

    //same as get-element-byid use creatRef()
    const view = React.createRef();
    
    //dx means a differential or distance of a gesture across the x-axis
    // -200 pixel based on the horizontaldrag negative value is smaller and 100 or + is bigger 
    const reconizeDrag =({dx}) => (dx < -200) ? true: false;

    const panResponder = PanResponder.create({
        onStartShouldSetPanResponder: () => true,
        
        //add a panhandlerGrant is a handler that is triggered when a gesture is first recognize
        onPanResponderGrant: () => {
            view.current.rubberBand(1000)
            .then(endState => console.log(endState.finished ? 'finished': 'canceled'))
        },
        onPanResponderEnd: (e, gestureState) => {
            console.log('pan responder end', gestureState);
            if (reconizeDrag(gestureState)){
                Alert.alert(
                    'Add Favorite',
                    'Are you sure you wish to add'+ campsite.name+ 'to favorite',
                    [
                        {
                            text: 'Cancel',
                            style: 'cancel',
                            onPress: () => console.log('Cancel Pressed')
                        },
                        {
                            text: 'OK',
                            onPress: () => props.favorite ?
                                console.log('Already set as Favorite') : props.markFavorite()

                        }
                    ],
                    {cancelable: false}
                );
            }
            return true;
        }
    });

    if (campsite) {
        return (
            <Animatable.View 
            animation='fadeInDown' 
            duration={2000} 
            delay={1000}
            ref={view}
            {...panResponder.panHandlers}>
                <Card
                    featuredTitle={campsite.name}
                    image={{ uri: baseUrl + campsite.image }}>
                    <Text style={{ margin: 10 }}>
                        {campsite.description}
                    </Text>
                    <View style={styles.cardRow}>
                        <Icon
                            name={props.favorite ? 'heart' : 'heart-o'}
                            type='font-awesome'
                            color='#f50'
                            raised
                            reverse
                            onPress={() => props.favorite ? console.log('Already set as a favorite') : props.markFavorite()}
                        />
                        <Icon
                            name='pencil'
                            type='font-awesome'
                            color='#5637DD'
                            raised
                            reverse
                            onPress={() => props.onShowModal()}
                        />
                    </View>
                </Card>
            </Animatable.View>
        );
    }
    return <View />;
}

function RenderComments({ comments }) {

    const renderCommentItem = ({ item }) => {
        return (
            <View style={{ margin: 10 }}>
                <Text style={{ fontSize: 14 }}>{item.text}</Text>
                <Rating
                    readonly
                    startingValue={item.rating}
                    imageSize={10}
                    style={{ alignItems: 'flex-start', paddingVertical: '5%' }}
                />
                <Text style={{ fontSize: 12 }}>{`-- ${item.author}, ${item.date}`}</Text>
            </View>
        );
    };

    return (
        <Animatable.View animation='fadeInUp' duration={2000} delay={1000}>
            <Card title='Comments'>
                <FlatList
                    data={comments}
                    renderItem={renderCommentItem}
                    keyExtractor={item => item.id.toString()}
                />
            </Card>
        </Animatable.View>
    );
}

class CampsiteInfo extends Component {

    constructor(props) {
        super(props);
        this.state = {
            showModal: false,
            rating: 5,
            author: '',
            text: ''
        };
    }

    toggleModal() {
        this.setState({ showModal: !this.state.showModal });
    }


    handleComment = (campsiteId) => {
        this.props.postComment({
            campsiteId,
            rating: this.state.rating,
            text: this.state.text,
            author: this.state.author,
        });
        this.toggleModal();
        console.log(JSON.stringify(this.state));
    };

    resetForm() {
        this.setState({
            showModal: false,
            rating: 5,
            author: '',
            text: ''
        });
    }

    markFavorite(campsiteId) {
        this.props.postFavorite(campsiteId);
    }

    static navigationOptions = {
        title: 'Campsite Information'
    }

    render() {
        const campsiteId = this.props.navigation.getParam('campsiteId');
        const campsite = this.props.campsites.campsites.filter(campsite => campsite.id === campsiteId)[0];
        const comments = this.props.comments.comments.filter(comment => comment.campsiteId === campsiteId);
        return (
            <ScrollView>
                <RenderCampsite campsite={campsite}
                    favorite={this.props.favorites.includes(campsiteId)}
                    markFavorite={() => this.markFavorite(campsiteId)}
                    onShowModal={() => this.toggleModal()}
                />
                <RenderComments comments={comments} />
                <Modal
                    animationType={'slide'}
                    transparent={false}
                    visible={this.state.showModal}
                    onRequestClose={() => this.toggleModal()}
                >
                    <View style={styles.modal}>
                        <View>
                            <Rating
                                showRating
                                ratingCount={5}
                                imageSize={40}
                                type="star"
                                startingValue={this.state.rating}
                                style={{ alignItems: 'center' }}
                                onFinishRating={(rating) => this.setState({ rating: rating })}

                            />
                            <View style={styles.leftIconContainerStyle}>
                                <Input
                                    value={this.state.author}
                                    placeholder="Author"
                                    leftIcon={{ type: 'font-awesome', name: 'user-o' }}
                                    leftIconContainerStyle={{ paddingRight: 10 }}
                                    onChangeText={(author) => this.setState({ author: author })}
                                />
                            </View>
                            <View>
                                <Input
                                    value={this.state.text}
                                    placeholder="Comment"
                                    leftIcon={{ type: 'font-awesome', name: 'comment-o' }}
                                    leftIconContainerStyle={{ paddingRight: 10 }}
                                    onChangeText={(text) => this.setState({ text: text })}
                                />
                            </View>
                            <View style={{ margin: 10 }}>
                                <Button
                                    color='#5637DD'
                                    title='Submit'
                                    onPress={() => {
                                        this.handleComment(campsiteId);
                                        this.resetForm();
                                    }}
                                />
                            </View>
                            <View style={{ margin: 10 }}>
                                <Button
                                    color='#808080'
                                    title='Cancel'
                                    style={{ margin: 10 }}
                                    onPress={() => this.toggleModal()}
                                />
                            </View>
                        </View>
                    </View>
                </Modal>
            </ScrollView>
        );
    }
}

const styles = StyleSheet.create({
    modal: {
        justifyContent: 'center',
        margin: 20,
    },
    cardRow: {
        alignItems: 'center',
        justifyContent: 'center',
        flex: 1,
        flexDirection: 'row',
        margin: 20
    },
    leftIconContainerStyle: {
        paddingRight: 10
    },
    button: {
        paddingBottom: 10
    }
});

export default connect(mapStateToProps, mapDispatchToProps)(CampsiteInfo);