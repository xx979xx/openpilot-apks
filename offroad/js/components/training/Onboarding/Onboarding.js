import React, { Component } from 'react';
import { View, Animated } from 'react-native';
import { NavigationActions } from 'react-navigation';
import { connect } from 'react-redux';

import Layout from '../../../native/Layout';
import { completeTrainingStep } from '../step';
import { onTrainingRouteCompleted } from '../../../utils/version';

import X from '../../../themes';
import Styles from './OnboardingStyles';

const Step = {
    OB_SPLASH: 'OB_SPLASH',
    OB_INTRO: 'OB_INTRO',
    OB_SENSORS: 'OB_SENSORS',
    OB_ENGAGE: 'OB_ENGAGE',
    OB_LANECHANGE: 'OB_LANECHANGE',
    OB_DISENGAGE: 'OB_DISENGAGE',
    OB_OUTRO: 'OB_OUTRO',
};

class Onboarding extends Component {
    static navigationOptions = {
        header: null,
    };

    constructor(props) {
        super(props);

        this.state = {
            step: Step.OB_SPLASH,
            stepPoint: 0,
            stepChecks: [],
            engagedMocked: false,
            photoOffset: new Animated.Value(0),
            photoCycled: new Animated.Value(0),
            photoCycledLast: new Animated.Value(0),
            leadEntered: new Animated.Value(0),
            gateHighlighted: new Animated.Value(0),
        };
    }

    componentWillMount() {
        this.handleEngagedMocked(false);
    }

    componentWillUnmount() {
        this.handleEngagedMocked(false);
    }

    setStep(step) {
        this.setState({
            step: '',
            stepChecks: [],
        }, () => {
            return this.setState({ step });
        });
    }

    setStepPoint(stepPoint) {
        this.setState({
            stepPoint: 0,
        }, () => {
            return this.setState({ stepPoint });
        })
    }

    handleRestartPressed = () => {
        this.props.restartTraining();
        this.setStep('OB_SPLASH');
    }

    handleIntroCheckboxPressed(stepCheck) {
        const { stepChecks } = this.state;
        if (stepChecks.indexOf(stepCheck) === -1) {
            const newStepChecks = [...stepChecks, stepCheck];
            this.setState({ stepChecks: newStepChecks });
            if (newStepChecks.length == 3) {
                setTimeout(() => {
                    this.setStep('OB_SENSORS');
                }, 300)
            }
        } else {
            stepChecks.splice(stepChecks.indexOf(stepCheck), 1);
            this.setState({ stepChecks });
        }
    }

    handleSensorRadioPressed(option) {
        switch(option) {
            case 'index':
                this.animatePhotoOffset(0);
                this.animatePhotoCycled(0);
                return this.setStepPoint(0); break;
            case 'camera':
                this.animatePhotoOffset(100);
                this.animatePhotoCycled(0);
                return this.setStepPoint(1); break;
            case 'radar':
                this.animatePhotoOffset(100);
                this.animatePhotoCycled(100);
                this.animateLeadEntered(100);
                return this.setStepPoint(2); break;
        }
    }

    handleEngageRadioPressed(option) {
        switch(option) {
            case 'index':
                this.animatePhotoOffset(0);
                this.animatePhotoCycled(0);
                this.animatePhotoCycledLast(0);
                return this.setStepPoint(0); break;
            case 'cruise':
                this.animatePhotoOffset(100);
                this.animatePhotoCycled(0);
                return this.setStepPoint(1); break;
            case 'monitoring':
                this.animatePhotoOffset(100);
                this.animatePhotoCycled(100);
                return this.setStepPoint(2); break;
        }
    }

    handleLaneChangeRadioPressed(option) {
        switch(option) {
            case 'index':
                this.animatePhotoOffset(0);
                this.animatePhotoCycled(0);
                this.animatePhotoCycledLast(0);
                return this.setStepPoint(0); break;
            case 'start':
                this.animatePhotoOffset(100);
                this.animatePhotoCycled(0);
                this.animatePhotoCycledLast(0);
                return this.setStepPoint(1); break;
            case 'perform':
                this.animatePhotoOffset(0);
                this.animatePhotoCycled(100);
                this.animatePhotoCycledLast(0);
                return this.setStepPoint(2); break;
        }
    }

    handleDisengageRadioPressed(option) {
        switch(option) {
            case 'index':
                this.animatePhotoOffset(0);
                this.animatePhotoCycled(0);
                this.animatePhotoCycledLast(0);
                return this.setStepPoint(0); break;
            case 'limitations':
                this.animatePhotoOffset(100);
                this.animatePhotoCycled(0);
                return this.setStepPoint(1); break;
            case 'disengage':
                this.animatePhotoOffset(100);
                this.animatePhotoCycledLast(100);
                return this.setStepPoint(2); break;
        }
    }

    handleSensorVisualPressed(visual) {
        const { stepChecks } = this.state;
        const hasCheck = (stepChecks.indexOf(visual) > -1);
        if (stepChecks.length > 0 && !hasCheck) {
            this.animatePhotoOffset(0);
            this.setState({ stepChecks: [...stepChecks, visual] });
            this.setStepPoint(0);
            return this.setStep('OB_ENGAGE');
        } else {
            this.setState({ stepChecks: [...stepChecks, visual] });
            switch(visual) {
                case 'camera':
                    this.animatePhotoCycled(100);
                    this.animateLeadEntered(100);
                    return this.setStepPoint(2); break;
                case 'radar':
                    this.animatePhotoOffset(0);
                    this.animateLeadEntered(0);
                    this.animatePhotoCycled(0);
                    this.setStepPoint(0);
                    return this.setStep('OB_ENGAGE'); break;
            }
        }
    }

    handleEngageVisualPressed(visual) {
        const { stepChecks } = this.state;
        const hasCheck = (stepChecks.indexOf(visual) > -1);
        this.setState({ stepChecks: [...stepChecks, visual] });
        switch(visual) {
            case 'cruise':
                this.animatePhotoCycled(100);
                this.handleEngagedMocked(true);
                return this.setStepPoint(2); break;
            case 'monitoring':
                this.animatePhotoOffset(100);
                this.animatePhotoCycled(100);
                this.animatePhotoCycledLast(100);
                this.setStepPoint(0);
                return this.setStep('OB_LANECHANGE'); break;
        }
    }

    handleLaneChangeVisualPressed(visual) {
        const { stepChecks } = this.state;
        const hasCheck = (stepChecks.indexOf(visual) > -1);
        this.setState({ stepChecks: [...stepChecks, visual] });
        switch(visual) {
            case 'start':
                this.animatePhotoOffset(100);
                this.animatePhotoCycled(100);
                this.animatePhotoCycledLast(100);
                return this.setStepPoint(2); break;
            case 'perform':
                this.animatePhotoOffset(100);
                this.animatePhotoCycled(100);
                this.animatePhotoCycledLast(100);
                this.setStepPoint(0);
                return this.setStep('OB_DISENGAGE'); break;
        }
    }

    handleDisengageVisualPressed(visual) {
        const { stepChecks } = this.state;
        const hasCheck = (stepChecks.indexOf(visual) > -1);
        this.setState({ stepChecks: [...stepChecks, visual] });
        switch(visual) {
            case 'limitations':
                this.animatePhotoOffset(100);
                this.animatePhotoCycled(100);
                this.animatePhotoCycledLast(100);
                return this.setStepPoint(2); break;
            case 'disengage':
                this.animatePhotoOffset(0);
                this.animatePhotoCycled(0);
                this.animatePhotoCycledLast(0);
                this.handleEngagedMocked(false);
                this.setStepPoint(0);
                return this.setStep('OB_OUTRO'); break;
        }
    }

    animatePhotoOffset(offset) {
        const { photoOffset } = this.state;
        Animated.timing(
            photoOffset,
            {
                toValue: offset,
                duration: 1000,
            }
        ).start();
    }

    animatePhotoCycled(offset) {
        const { photoCycled } = this.state;
        Animated.timing(
            photoCycled,
            {
                toValue: offset,
                duration: 800,
            }
        ).start();
    }

    animatePhotoCycledLast(offset) {
        const { photoCycledLast } = this.state;
        Animated.timing(
            photoCycledLast,
            {
                toValue: offset,
                duration: 800,
            }
        ).start();
    }

    animateLeadEntered(offset) {
        const { leadEntered } = this.state;
        Animated.timing(
            leadEntered,
            {
                toValue: offset,
                duration: 500,
            }
        ).start();
    }

    animateTouchGateHighlighted(amount) {
        const { gateHighlighted } = this.state;
        Animated.sequence([
          Animated.timing(
            gateHighlighted,
            {
              toValue: amount,
              duration: 300,
            }
          ),
          Animated.timing(
              gateHighlighted,
              {
                  toValue: 0,
                  duration: 500,
              }
          )
        ]).start()
    }

    handleWrongGatePressed() {
        this.animateTouchGateHighlighted(50);
    }

    handleEngagedMocked(shouldMock) {
        this.setState({ engagedMocked: shouldMock })
        Layout.setMockEngaged(shouldMock);
    }

    renderSplashStep() {
        return (
            <X.Entrance style={ Styles.onboardingSplashView }>
                <X.Text
                    size='jumbo' color='white' weight='bold'
                    style={ Styles.onboardingStepHeader }>
                    オープンパイロットアルファへようこそ
                </X.Text>
                <X.Text
                    color='white' weight='light'
                    style={ Styles.onboardingStepContext }>
                    これですべてのセットアップが完了したので
                    テストを行う前にアルファ版としての
                    オープンパイロットの機能と制限を頭に入れてください。
                </X.Text>
                <View style={ Styles.onboardingPrimaryAction }>
                    <X.Button
                        color='setupPrimary'
                        onPress={ () => this.setStep('OB_INTRO') }>
                        トレーニング開始
                    </X.Button>
                </View>
            </X.Entrance>
        )
    }

    renderIntroStep() {
        const { stepChecks } = this.state;
        return (
            <X.Entrance style={ Styles.onboardingStep }>
                <View style={ Styles.onboardingStepPoint }>
                    <View style={ Styles.onboardingStepPointChain }>
                        <X.Button
                            size='small' color='ghost'
                            style={ Styles.onboardingStepPointChainPrevious }
                            onPress={ () => this.setStep('OB_SPLASH') }>
                            <X.Image
                                source={ require('../../../img/icon_chevron_right.png') }
                                style={ Styles.onboardingStepPointChainPreviousIcon } />
                        </X.Button>
                        <View style={ Styles.onboardingStepPointChainNumber }>
                            <X.Text color='white' weight='semibold'>
                                1
                            </X.Text>
                        </View>
                    </View>
                    <View style={ Styles.onboardingStepPointBody }>
                        <X.Text size='bigger' color='white' weight='bold'>
                            オープンパイロットは先進的な運転支援システムです。
                        </X.Text>
                        <X.Text
                            size='smallish' color='white' weight='light'
                            style={ Styles.onboardingStepContextSmall }>
                            運転支援システムは自動運転車ではありません。
                            つまり、オープンパイロットはあなたが必要です。
                            運転には必ずあなたが必要です。
                        </X.Text>
                        <X.CheckboxField
                            size='small'
                            color='white'
                            isChecked={ stepChecks.includes(1) }
                            onPress={ () => this.handleIntroCheckboxPressed(1) }
                            label='目を離さないようにしてください。' />
                        <X.CheckboxField
                            size='small'
                            color='white'
                            isChecked={ stepChecks.includes(2) }
                            onPress={ () => this.handleIntroCheckboxPressed(2) }
                            label='いつでもあなたのみで運転できるようにしておきます。' />
                        <X.CheckboxField
                            size='small'
                            color='white'
                            isChecked={ stepChecks.includes(3) }
                            onPress={ () => this.handleIntroCheckboxPressed(3) }
                            label='いつでも引き継げるように準備しておきます!' />
                    </View>
                </View>
            </X.Entrance>
        )
    }

    renderSensorsStepPointIndex() {
        const { stepChecks } = this.state;
        return (
            <View style={ Styles.onboardingStepPoint }>
                <View style={ Styles.onboardingStepPointChain }>
                    <X.Button
                        size='small' color='ghost'
                        style={ Styles.onboardingStepPointChainPrevious }
                        onPress={ () => this.setStep('OB_INTRO') }>
                        <X.Image
                            source={ require('../../../img/icon_chevron_right.png') }
                            style={ Styles.onboardingStepPointChainPreviousIcon } />
                    </X.Button>
                    <View style={ Styles.onboardingStepPointChainNumber }>
                        <X.Text color='white' weight='semibold'>
                            2
                        </X.Text>
                    </View>
                </View>
                <View style={ Styles.onboardingStepPointBody }>
                    <X.Text size='bigger' color='white' weight='bold'>
                        オープンパイロットでは、複数のセンサーを使用して前方の道路を確認しています。
                    </X.Text>
                    <X.Text
                        size='smallish' color='white' weight='light'
                        style={ Styles.onboardingStepContextSmall }>
                        車のコントロールに必要な信号が送信される前に,
                        センサーからの情報で道路状況が構築されます。
                    </X.Text>
                    <X.RadioField
                        size='big'
                        color='white'
                        isChecked={ stepChecks.includes('camera') }
                        hasAppend={ true }
                        onPress={ () => this.handleSensorRadioPressed('camera') }
                        label='デバイスのカメラ' />
                    <X.RadioField
                        size='big'
                        color='white'
                        isDisabled={ !stepChecks.includes('camera') }
                        isChecked={ stepChecks.includes('radar') }
                        hasAppend={ true }
                        onPress={ () => this.handleSensorRadioPressed('radar') }
                        label='車のレーダー' />
                </View>
            </View>
        )
    }

    renderSensorsStepPointCamera() {
        return (
            <X.Entrance
                transition='fadeInLeft'
                duration={ 1000 }
                style={ Styles.onboardingStepPointSmall }>
                <X.Button
                    size='small' color='ghost' textWeight='light'
                    style={ Styles.onboardingStepPointCrumb }
                    onPress={ () => this.handleSensorRadioPressed('index') }>
                    オープンパイロットのセンサー
                </X.Button>
                <X.Text size='medium' color='white' weight='bold'>
                    デバイスのカメラ
                </X.Text>
                <X.Text
                    size='small' color='white' weight='light'
                    style={ Styles.onboardingStepContextSmaller }>
                    ビジョンアルゴリズムは道路側のカメラを利用して
                    走行するべき道を決定します。
                </X.Text>
                <X.Text
                    size='small' color='white' weight='light'
                    style={ Styles.onboardingStepContextSmaller }>
                    車線はいろいろな方法で描かれています。
                </X.Text>
                <X.Button color='ghost'
                    style={ Styles.onboardingStepPointInstruction }
                    onPress={ () => this.animateTouchGateHighlighted(100) }>
                    <X.Text
                        size='small' color='white' weight='semibold'
                        style={ Styles.onboardingStepPointInstructionText }>
                        パスを選択して続行します
                    </X.Text>
                    <X.Image
                      source={ require('../../../img/icon_chevron_right.png') }
                      style={ Styles.onboardingStepPointInstructionIcon } />
                </X.Button>
            </X.Entrance>
        )
    }

    renderSensorsStepPointRadar() {
        return (
            <X.Entrance
                transition='fadeInLeft'
                duration={ 1000 }
                style={ Styles.onboardingStepPointSmall }>
                <X.Button
                    size='small' color='ghost' textWeight='light'
                    style={ Styles.onboardingStepPointCrumb }
                    onPress={ () => this.handleSensorRadioPressed('index') }>
                    オープンパイロットのセンサー
                </X.Button>
                <X.Text size='medium' color='white' weight='bold'>
                    あなたの車のレーダー
                </X.Text>
                <X.Text
                    size='small' color='white' weight='light'
                    style={ Styles.onboardingStepContextSmaller }>
                    あなたの車のレーダーはオープンパイロットが
                    前方の距離を測定するのに役に立ちます。
                </X.Text>
                <X.Text
                    size='small' color='white' weight='light'
                    style={ Styles.onboardingStepContextSmaller }>
                    インジケーターは赤か黄色で描かれます。
                    前方の車との相対速度を表示しています。
                </X.Text>
                <X.Button color='ghost'
                    style={ Styles.onboardingStepPointInstruction }
                    onPress={ () => this.handleWrongGatePressed() }>
                    <X.Text
                        size='small' color='white' weight='semibold'
                        style={ Styles.onboardingStepPointInstructionText }>
                        リードカーのインジケータを選択します。
                    </X.Text>
                    <X.Image
                        source={ require('../../../img/icon_chevron_right.png') }
                        style={ Styles.onboardingStepPointInstructionIcon } />
                </X.Button>
            </X.Entrance>
        )
    }

    renderSensorsStep() {
        return (
            <X.Entrance style={ Styles.onboardingStep }>
                { this.renderSensorsStepPoint() }
            </X.Entrance>
        )
    }

    renderEngagingStepPointIndex() {
        const { stepChecks } = this.state;
        return (
            <View style={ Styles.onboardingStepPoint }>
                <View style={ Styles.onboardingStepPointChain }>
                    <X.Button
                        size='small' color='ghost'
                        style={ Styles.onboardingStepPointChainPrevious }
                        onPress={ () => this.setStep('OB_SENSORS') }>
                        <X.Image
                            source={ require('../../../img/icon_chevron_right.png') }
                            style={ Styles.onboardingStepPointChainPreviousIcon } />
                    </X.Button>
                    <View style={ Styles.onboardingStepPointChainNumber }>
                        <X.Text color='white' weight='semibold'>
                            3
                        </X.Text>
                    </View>
                </View>
                <View style={ Styles.onboardingStepPointBody }>
                    <X.Text size='bigger' color='white' weight='bold'>
                        クルーズコントロールが有効になっている場合にオープンパイロットが利用できます。
                    </X.Text>
                    <X.Text
                        size='smallish' color='white' weight='light'
                        style={ Styles.onboardingStepContext }>
                        クルーズボタンを押すと作動し、ペダルを踏むと解除されます。
                    </X.Text>
                    <X.RadioField
                        size='big'
                        color='white'
                        isChecked={ stepChecks.includes('cruise') }
                        hasAppend={ true }
                        onPress={ () => this.handleEngageRadioPressed('cruise') }
                        label='オープンパイロットを活用する' />
                    <X.RadioField
                        size='big'
                        color='white'
                        isDisabled={ !stepChecks.includes('cruise') }
                        isChecked={ stepChecks.includes('monitoring') }
                        hasAppend={ true }
                        onPress={ () => this.handleEngageRadioPressed('monitoring') }
                        label='ドライバー監視' />
                </View>
            </View>
        )
    }

    renderEngagingStepPointEngage() {
        return (
            <X.Entrance
                transition='fadeInLeft'
                duration={ 1000 }
                style={ Styles.onboardingStepPointSmall }>
                <X.Button
                    size='small' color='ghost' textWeight='light'
                    style={ Styles.onboardingStepPointCrumb }
                    onPress={ () => this.handleEngageRadioPressed('index') }>
                    オープンパイロットの魅力
                </X.Button>
                <X.Text size='medium' color='white' weight='bold'>
                    オープンパイロットを活用
                </X.Text>
                <X.Text
                    size='small' color='white' weight='light'
                    style={ Styles.onboardingStepContextSmaller }>
                    快適な速度でオープンパイロットを利用する準備ができたら
                    クルーズコントロールボタンの位置を確認し
                    "SET" を押します。
                </X.Text>
                <X.Button color='ghost'
                    style={ Styles.onboardingStepPointInstruction }
                    onPress={ () => this.handleWrongGatePressed() }>
                    <X.Text
                        size='small' color='white' weight='semibold'
                        style={ Styles.onboardingStepPointInstructionText }>
                        画面上の"SET"を押して次の操作をします。
                    </X.Text>
                    <X.Image
                        source={ require('../../../img/icon_chevron_right.png') }
                        style={ Styles.onboardingStepPointInstructionIcon } />
                </X.Button>
            </X.Entrance>
        )
    }

    renderEngagingStepPointMonitoring() {
        return (
            <X.Entrance
                transition='fadeInLeft'
                duration={ 1000 }
                style={ Styles.onboardingStepPointSmall }>
                <X.Entrance>
                    <X.Button
                        size='small' color='ghost' textWeight='light'
                        style={ Styles.onboardingStepPointCrumb }
                        onPress={ () => this.handleEngageRadioPressed('index') }>
                        オープンパイロットの魅力
                    </X.Button>
                    <X.Text size='medium' color='white' weight='bold'>
                        ドライバー監視
                    </X.Text>
                    <X.Text
                        size='small' color='white' weight='light'
                        style={ Styles.onboardingStepContextSmaller }>
                        オープンパイロット作動中は常に注意してください!
                        オープンパイロットは顔の3Dモデルを構築し監視します。
                        注意力散漫なドライバーには警告が表示され
                        改善されるまでオープンパイロットはオフになります。
                    </X.Text>
                    <X.Button color='ghost'
                        style={ Styles.onboardingStepPointInstruction }
                        onPress={ () => this.handleWrongGatePressed() }>
                        <X.Text
                            size='small' color='white' weight='semibold'
                            style={ Styles.onboardingStepPointInstructionText }>
                            顔を選択して続ける
                        </X.Text>
                        <X.Image
                            source={ require('../../../img/icon_chevron_right.png') }
                            style={ Styles.onboardingStepPointInstructionIcon } />
                    </X.Button>
                </X.Entrance>
            </X.Entrance>
        )
    }

    renderLaneChangeStepPointIndex() {
        const { stepChecks } = this.state;
        return (
            <View style={ Styles.onboardingStepPoint }>
                <View style={ Styles.onboardingStepPointChain }>
                    <X.Button
                        size='small' color='ghost'
                        style={ Styles.onboardingStepPointChainPrevious }
                        onPress={ () => this.setStep('OB_ENGAGE') }>
                        <X.Image
                            source={ require('../../../img/icon_chevron_right.png') }
                            style={ Styles.onboardingStepPointChainPreviousIcon } />
                    </X.Button>
                    <View style={ Styles.onboardingStepPointChainNumber }>
                        <X.Text color='white' weight='semibold'>
                            4
                        </X.Text>
                    </View>
                </View>
                <View style={ Styles.onboardingStepPointBody }>
                    <X.Text size='bigger' color='white' weight='bold'>
                        オープンパイロットはあなたの力を借りて車線変更を行います。
                    </X.Text>
                    <X.Text
                        size='smallish' color='white' weight='light'
                        style={ Styles.onboardingStepContextSmall }>
                        オープンパイロットは車線変更が安全かどうかわかりません。たとえすぐそこにほかの車がいたとしても容赦なく車線変更を行います。
                    </X.Text>
                    <X.RadioField
                        size='big'
                        color='white'
                        isChecked={ stepChecks.includes('start') }
                        hasAppend={ true }
                        onPress={ () => this.handleLaneChangeRadioPressed('start') }
                        label='車線変更を開始' />
                    <X.RadioField
                        size='big'
                        color='white'
                        isDisabled={ !stepChecks.includes('start') }
                        isChecked={ stepChecks.includes('perform') }
                        hasAppend={ true }
                        onPress={ () => this.handleLaneChangeRadioPressed('perform') }
                        label='車線変更を行う' />
                </View>
            </View>
        )
    }

    renderLaneChangeStepPointStart() {
        return (
            <X.Entrance
                transition='fadeInLeft'
                duration={ 1000 }
                style={ Styles.onboardingStepPointSmall }>
                <X.Entrance>
                    <X.Button
                        size='small' color='ghost' textWeight='light'
                        style={ Styles.onboardingStepPointCrumb }
                        onPress={ () => this.handleLaneChangeRadioPressed('index') }>
                        オープンパイロットの制御
                    </X.Button>
                    <X.Text size='medium' color='white' weight='bold'>
                        車線変更を開始
                    </X.Text>
                    <X.Text
                        size='small' color='white' weight='light'
                        style={ Styles.onboardingStepContextSmaller }>
                        オープンパイロットを使用しています。
                        周囲を確認し車線変更が安全か確認してください。
                    </X.Text>
                    <X.Button color='ghost'
                        style={ Styles.onboardingStepPointInstruction }
                        onPress={ () => this.handleWrongGatePressed() }>
                        <X.Text
                            size='small' color='white' weight='semibold'
                            style={ Styles.onboardingStepPointInstructionText }>
                            方向指示器を選択
                        </X.Text>
                        <X.Image
                            source={ require('../../../img/icon_chevron_right.png') }
                            style={ Styles.onboardingStepPointInstructionIcon } />
                    </X.Button>
                </X.Entrance>
            </X.Entrance>
        )
    }

    renderLaneChangeStepPointPerform() {
        return (
            <X.Entrance
                transition='fadeInLeft'
                duration={ 1000 }
                style={ Styles.onboardingStepPointSmall }>
                <X.Entrance>
                    <X.Button
                        size='small' color='ghost' textWeight='light'
                        style={ Styles.onboardingStepPointCrumb }
                        onPress={ () => this.handleLaneChangeRadioPressed('index') }>
                        オープンパイロットの車線変更
                    </X.Button>
                    <X.Text size='medium' color='white' weight='bold'>
                        車線変更を実行する
                    </X.Text>
                    <X.Text
                        size='small' color='white' weight='light'
                        style={ Styles.onboardingStepContextSmaller }>
                        安全のため常に周囲を確認してください。
                        好きな方向に向かってハンドルをやさしく動かしてください。
                        方向指示器とハンドルの組み合わせでオープンパイロット
                        が車線変更を行います。
                    </X.Text>
                    <X.Button color='ghost'
                        style={ Styles.onboardingStepPointInstruction }
                        onPress={ () => this.handleWrongGatePressed() }>
                        <X.Text
                            size='small' color='white' weight='semibold'
                            style={ Styles.onboardingStepPointInstructionText }>
                            ハンドルを選択
                        </X.Text>
                        <X.Image
                            source={ require('../../../img/icon_chevron_right.png') }
                            style={ Styles.onboardingStepPointInstructionIcon } />
                    </X.Button>
                </X.Entrance>
            </X.Entrance>
        )
    }

    renderDisengagingStepPointIndex() {
        const { stepChecks } = this.state;
        return (
            <View style={ Styles.onboardingStepPoint }>
                <View style={ Styles.onboardingStepPointChain }>
                    <X.Button
                        size='small' color='ghost'
                        style={ Styles.onboardingStepPointChainPrevious }
                        onPress={ () => this.setStep('OB_LANECHANGE') }>
                        <X.Image
                            source={ require('../../../img/icon_chevron_right.png') }
                            style={ Styles.onboardingStepPointChainPreviousIcon } />
                    </X.Button>
                    <View style={ Styles.onboardingStepPointChainNumber }>
                        <X.Text color='white' weight='semibold'>
                            5
                        </X.Text>
                    </View>
                </View>
                <View style={ Styles.onboardingStepPointBody }>
                    <X.Text size='bigger' color='white' weight='bold'>
                        オープンパイロットはペダルを踏むと解除されます。.
                    </X.Text>
                    <X.Text
                        size='smallish' color='white' weight='light'
                        style={ Styles.onboardingStepContextSmall }>
                        安全でない可能性のある状況に遭遇したら場合や、
                        高速道路を降りるときは好きなペダルで解除できます。
                    </X.Text>
                    <X.RadioField
                        size='big'
                        color='white'
                        isChecked={ stepChecks.includes('limitations') }
                        hasAppend={ true }
                        onPress={ () => this.handleDisengageRadioPressed('limitations') }
                        label='限定された機能' />
                    <X.RadioField
                        size='big'
                        color='white'
                        isDisabled={ !stepChecks.includes('limitations') }
                        isChecked={ stepChecks.includes('disengage') }
                        hasAppend={ true }
                        onPress={ () => this.handleDisengageRadioPressed('disengage') }
                        label='車線変更を実行' />
                </View>
            </View>
        )
    }

    renderDisengagingStepPointLimitations() {
        return (
            <X.Entrance
                transition='fadeInLeft'
                duration={ 1000 }
                style={ Styles.onboardingStepPointSmall }>
                <X.Entrance>
                    <X.Button
                        size='small' color='ghost' textWeight='light'
                        style={ Styles.onboardingStepPointCrumb }
                        onPress={ () => this.handleDisengageRadioPressed('index') }>
                        オープンパイロットの解除
                    </X.Button>
                    <X.Text size='medium' color='white' weight='bold'>
                        限定された機能
                    </X.Text>
                    <X.Text
                        size='small' color='white' weight='light'
                        style={ Styles.onboardingStepContextSmaller }>
                        特定の状況ではオープンパイロットは機能しません。
                        信号、標識、歩行者などは認識することができず
                        加速してしまうことがあります。
                    </X.Text>
                    <X.Button color='ghost'
                        style={ Styles.onboardingStepPointInstruction }
                        onPress={ () => this.handleWrongGatePressed() }>
                        <X.Text
                            size='small' color='white' weight='semibold'
                            style={ Styles.onboardingStepPointInstructionText }>
                            光を選択して続ける
                        </X.Text>
                        <X.Image
                            source={ require('../../../img/icon_chevron_right.png') }
                            style={ Styles.onboardingStepPointInstructionIcon } />
                    </X.Button>
                </X.Entrance>
            </X.Entrance>
        )
    }

    renderDisengagingStepPointDisengage() {
        return (
            <X.Entrance
                transition='fadeInLeft'
                duration={ 1000 }
                style={ Styles.onboardingStepPointSmall }>
                <X.Entrance>
                    <X.Button
                        size='small' color='ghost' textWeight='light'
                        style={ Styles.onboardingStepPointCrumb }
                        onPress={ () => this.handleDisengageRadioPressed('index') }>
                        オープンパイロット解除
                    </X.Button>
                    <X.Text size='medium' color='white' weight='bold'>
                        オープンパイロットを解除
                    </X.Text>
                    <X.Text
                        size='small' color='white' weight='light'
                        style={ Styles.onboardingStepContextSmaller }>
                        オープンパイロットの作動中はハンドル操作をしなくても大丈夫です。
                        でも、手は添えてくださいね？
                        ペダルを踏んで解除するまで前方の車との距離はオープンパイロットにより管理されます。
                    </X.Text>
                    <X.Button color='ghost'
                        style={ Styles.onboardingStepPointInstruction }
                        onPress={ () => this.handleWrongGatePressed() }>
                        <X.Text
                            size='small' color='white' weight='semibold'
                            style={ Styles.onboardingStepPointInstructionText }>
                            ペダルをタップして解除します。
                        </X.Text>
                        <X.Image
                            source={ require('../../../img/icon_chevron_right.png') }
                            style={ Styles.onboardingStepPointInstructionIcon } />
                    </X.Button>
                </X.Entrance>
            </X.Entrance>
        )
    }

    renderEngagingStep() {
        return (
            <X.Entrance style={ Styles.onboardingStep }>
                { this.renderEngagingStepPoint() }
            </X.Entrance>
        )
    }

    renderLaneChangeStep() {
        return (
            <X.Entrance style={ Styles.onboardingStep }>
                { this.renderLaneChangeStepPoint() }
            </X.Entrance>
        )
    }

    renderDisengagingStep() {
        return (
            <X.Entrance style={ Styles.onboardingStep }>
                { this.renderDisengagingStepPoint() }
            </X.Entrance>
        )
    }

    renderOutroStep() {
        return (
            <X.Entrance style={ Styles.onboardingOutroView }>
                <X.Text
                    size='jumbo' color='white' weight='bold'
                    style={ Styles.onboardingStepHeader }>
                    おめでとう！これでオープンパイロットの訓練は完了です。
                </X.Text>
                <X.Text
                    color='white' weight='light'
                    style={ Styles.onboardingStepContextSmaller }>
                    このガイドは設定からいつでも再生することができます。
                    オープンパイロットについてもっと知りたい人は
                    wikiを読み、discord.comma.aiのコミュニティに参加してください。
                </X.Text>
                <X.Line color='transparent' spacing='small' />
                <View style={ Styles.onboardingActionsRow }>
                    <View style={ Styles.onboardingPrimaryAction }>
                        <X.Button
                            color='setupPrimary'
                            onPress={ this.props.completeTrainingStep }>
                            トレーニングを終わる
                        </X.Button>
                    </View>
                    <View style={ Styles.onboardingSecondaryAction }>
                        <X.Button
                            color='setupInverted'
                            textColor='white'
                            onPress={ this.handleRestartPressed }>
                            リスタート
                        </X.Button>
                    </View>
                </View>
            </X.Entrance>
        )
    }

    renderSensorsStepPoint() {
        const { stepPoint } = this.state;
        switch (stepPoint) {
            case 0:
                return this.renderSensorsStepPointIndex(); break;
            case 1:
                return this.renderSensorsStepPointCamera(); break;
            case 2:
                return this.renderSensorsStepPointRadar(); break;
        }
    }

    renderEngagingStepPoint() {
        const { stepPoint } = this.state;
        switch (stepPoint) {
            case 0:
                return this.renderEngagingStepPointIndex(); break;
            case 1:
                return this.renderEngagingStepPointEngage(); break;
            case 2:
                return this.renderEngagingStepPointMonitoring(); break;
        }
    }

    renderLaneChangeStepPoint() {
        const { stepPoint } = this.state;
        switch (stepPoint) {
            case 0:
                return this.renderLaneChangeStepPointIndex(); break;
            case 1:
                return this.renderLaneChangeStepPointStart(); break;
            case 2:
                return this.renderLaneChangeStepPointPerform(); break;
        }
    }

    renderDisengagingStepPoint() {
        const { stepPoint } = this.state;
        switch (stepPoint) {
            case 0:
                return this.renderDisengagingStepPointIndex(); break;
            case 1:
                return this.renderDisengagingStepPointLimitations(); break;
            case 2:
                return this.renderDisengagingStepPointDisengage(); break;
        }
    }

    renderStep() {
        const { step } = this.state;
        switch (step) {
            case Step.OB_SPLASH:
                return this.renderSplashStep(); break;
            case Step.OB_INTRO:
                return this.renderIntroStep(); break;
            case Step.OB_SENSORS:
                return this.renderSensorsStep(); break;
            case Step.OB_ENGAGE:
                return this.renderEngagingStep(); break;
            case Step.OB_LANECHANGE:
                return this.renderLaneChangeStep(); break;
            case Step.OB_DISENGAGE:
                return this.renderDisengagingStep(); break;
            case Step.OB_OUTRO:
                return this.renderOutroStep(); break;
        }
    }

    render() {
        const {
            step,
            stepPoint,
            stepChecks,
            photoOffset,
            photoCycled,
            photoCycledLast,
            leadEntered,
            engagedMocked,
            gateHighlighted,
        } = this.state;

        const overlayStyle = [
            Styles.onboardingOverlay,
            stepPoint > 0 ? Styles.onboardingOverlayCollapsed : null,
        ];

        const gradientColor = engagedMocked ? 'engaged_green' : 'dark_blue';

        const Animations = {
            leadIndicatorDescended: {
                transform: [{
                    translateY: photoCycled.interpolate({
                        inputRange: [0, 100],
                        outputRange: [0, 40]
                    })
                }, {
                    translateX: photoCycled.interpolate({
                        inputRange: [0, 100],
                        outputRange: [0, -10]
                    })
                }, {
                    scaleX: photoCycled.interpolate({
                        inputRange: [0, 100],
                        outputRange: [1, 1.5]
                    })
                }, {
                    scaleY: photoCycled.interpolate({
                        inputRange: [0, 100],
                        outputRange: [1, 1.5]
                    })
                }]
            },
        };

        return (
            <View style={ Styles.onboardingContainer }>
                <Animated.Image
                    source={ require('../../../img/photo_baybridge_a_01.jpg') }
                    style={ [Styles.onboardingPhoto, {
                        transform: [{
                            translateX: photoOffset.interpolate({
                                inputRange: [0, 100],
                                outputRange: [0, -50]
                            })
                        }],
                    }] }>
                </Animated.Image>
                <Animated.Image
                    source={ require('../../../img/illustration_training_lane_01.png') }
                    style={ [Styles.onboardingVisualLane, {
                        transform: [{
                            translateX: photoOffset.interpolate({
                                inputRange: [0, 100],
                                outputRange: [50, 0]
                            })
                        }],
                        opacity: photoOffset.interpolate({
                            inputRange: [0, 100],
                            outputRange: [0, 1],
                        })
                    }] } />

                <View style={[{ flexDirection: 'row',
        justifyContent: 'center', position: 'absolute' }, Styles.onboardingVisualLane]}>
                    <Animated.Image
                        source={ require('../../../img/illustration_training_lane_01.png') }
                        tintColor='lime'
                        pointerEvents='none'
                        style={ [Styles.absoluteFill, {
                            opacity: gateHighlighted.interpolate({
                                inputRange: [0, 100],
                                outputRange: [0, 1],
                            })
                        }] } />
                    { stepPoint == 1 ? (
                        <View style={ Styles.onboardingVisualLaneTouchGate }>
                            <X.Button
                                onPress={ () => { this.handleSensorVisualPressed('camera') } }
                                style={ Styles.onboardingVisualLaneTouchGateButton } />
                        </View>
                    ) : null }
                </View>

                { (step === 'OB_SENSORS' && stepPoint > 1) ? (
                    <View style={ Styles.onboardingVisuals }>
                        <Animated.Image
                            source={ require('../../../img/photo_baybridge_b_01.jpg') }
                            style={ [Styles.onboardingPhotoCycled, {
                                opacity: photoCycled.interpolate({
                                    inputRange: [0, 100],
                                    outputRange: [0, 1],
                                })
                            }] } />
                        <Animated.Image
                            source={ require('../../../img/illustration_training_lane_02.png') }
                            style={ [Styles.onboardingVisualLaneZoomed, {
                                opacity: photoCycled.interpolate({
                                    inputRange: [0, 100],
                                    outputRange: [0, 1],
                                })
                            }] }>
                        </Animated.Image>
                        <Animated.Image
                            source={ require('../../../img/illustration_training_lead_01.png') }
                            style={ [Styles.onboardingVisualLead,
                                Animations.leadIndicatorDescended ] } />
                        <Animated.Image
                            source={ require('../../../img/illustration_training_lead_02.png') }
                            style={ [Styles.onboardingVisualLead,
                                Styles.onboardingVisualLeadZoomed,
                                Animations.leadIndicatorDescended, {
                                opacity: photoCycled.interpolate({
                                    inputRange: [0, 100],
                                    outputRange: [0, 1]
                                }),
                            }] } />
                        <Animated.View
                            style={ [Styles.onboardingVisualLeadTouchGate,
                                Animations.leadIndicatorDescended, {
                                  opacity: gateHighlighted.interpolate({
                                      inputRange: [0, 100],
                                      outputRange: [0, 1],
                                  }),
                                }] }>
                            <X.Button
                                style={ Styles.onboardingVisualLeadTouchGateButton }
                                onPress={ () => { this.handleSensorVisualPressed('radar') } } />
                        </Animated.View>
                    </View>
                ) : null }

                { step === 'OB_ENGAGE' ? (
                    <View style={ Styles.onboardingVisuals }>
                        <Animated.Image
                            source={ require('../../../img/photo_wheel_buttons_01.jpg') }
                            style={ [Styles.onboardingPhotoCruise] } />
                        { stepPoint == 1 ? (
                            <Animated.View
                              style={ [Styles.onboardingVisualCruiseTouchContainer, {
                                opacity: gateHighlighted.interpolate({
                                    inputRange: [0, 100],
                                    outputRange: [0, 1],
                                }),
                              }] }>
                                <X.Button
                                    style={ Styles.onboardingVisualCruiseTouchGateButton }
                                    onPress={ () => { this.handleEngageVisualPressed('cruise') } } />
                            </Animated.View>
                        ) : null }
                        { stepPoint == 2 ? (
                            <React.Fragment>
                                <Animated.Image
                                    source={ require('../../../img/photo_monitoring_01.jpg') }
                                    style={ [Styles.onboardingPhotoCycled, Styles.onboardingFaceImage, {
                                        opacity: photoCycled.interpolate({
                                            inputRange: [0, 100],
                                            outputRange: [0, 1],
                                        }),
                                    }] }>
                                </Animated.Image>
                                <Animated.View style={ [Styles.onboardingFaceTouchGate, {
                                  opacity: gateHighlighted.interpolate({
                                      inputRange: [0, 100],
                                      outputRange: [0, 1],
                                  }),
                                }]}>
                                    <X.Button
                                        style={ Styles.onboardingTouchGateButton }
                                        onPress={ () => { this.handleEngageVisualPressed('monitoring') } } />
                                </Animated.View>
                            </React.Fragment>
                        ) : null }
                    </View>
                ) : null }

                { step === 'OB_LANECHANGE' ? (
                    <View style={ Styles.onboardingVisuals }>
                        <Animated.Image
                            source={ require('../../../img/photo_turn_signal_02.jpg') }
                            style={ [Styles.onboardingPhotoSignal] } />
                        { stepPoint == 1 ? (
                            <Animated.View style={ [Styles.onboardingSignalTouchGate, {
                              opacity: gateHighlighted.interpolate({
                                  inputRange: [0, 100],
                                  outputRange: [0, 1],
                              }),
                            }]}>
                                <X.Button
                                    style={ Styles.onboardingTouchGateButton }
                                    onPress={ () => { this.handleLaneChangeVisualPressed('start') } } />
                            </Animated.View>
                        ) : null }
                        { stepPoint == 2 ? (
                            <React.Fragment>
                                <Animated.Image
                                    source={ require('../../../img/photo_wheel_hands_01.jpg') }
                                    style={ [Styles.onboardingPhotoCycled, {
                                        opacity: photoCycled.interpolate({
                                            inputRange: [0, 100],
                                            outputRange: [0, 1],
                                        }),
                                    }] }>
                                </Animated.Image>
                                <Animated.View style={ [Styles.onboardingWheelTouchGate, {
                                  opacity: gateHighlighted.interpolate({
                                      inputRange: [0, 100],
                                      outputRange: [0, 1],
                                  }),
                                }]}>
                                    <X.Button
                                        style={ Styles.onboardingTouchGateButton }
                                        onPress={ () => { this.handleLaneChangeVisualPressed('perform') } } />
                                </Animated.View>
                            </React.Fragment>
                        ) : null }
                    </View>
                ) : null }

                { step === 'OB_DISENGAGE' ? (
                    <View style={ Styles.onboardingVisuals }>
                        <Animated.Image
                            source={ require('../../../img/photo_traffic_light_01.jpg') }
                            style={ [Styles.onboardingPhotoCruise] } />
                        { stepPoint == 1 ? (
                            <Animated.View style={ [Styles.onboardingLightTouchGate, {
                                opacity: gateHighlighted.interpolate({
                                    inputRange: [0, 100],
                                    outputRange: [0, 1],
                                }),
                            }]}>
                                <X.Button
                                    style={ Styles.onboardingTouchGateButton }
                                    onPress={ () => { this.handleDisengageVisualPressed('limitations') } } />
                            </Animated.View>
                        ) : null }
                        { stepPoint == 2 ? (
                            <View style={ Styles.onboardingVisuals }>
                                <Animated.Image
                                    source={ require('../../../img/photo_pedals_01.jpg') }
                                    style={ [Styles.onboardingPhotoCycled, Styles.onboardingPhotoPedals, {
                                        opacity: photoCycledLast.interpolate({
                                            inputRange: [0, 100],
                                            outputRange: [0, 1],
                                        }),
                                    }] } />
                                <Animated.View style={ [Styles.onboardingBrakePedalTouchGate, {
                                  opacity: gateHighlighted.interpolate({
                                      inputRange: [0, 100],
                                      outputRange: [0, 1],
                                  }),
                                }]}>
                                    <X.Button
                                        style={ Styles.onboardingTouchGateButton }
                                        onPress={ () => { this.handleDisengageVisualPressed('disengage') } } />
                                </Animated.View>
                                <Animated.View style={ [Styles.onboardingGasPedalTouchGate, {
                                  opacity: gateHighlighted.interpolate({
                                      inputRange: [0, 100],
                                      outputRange: [0, 1],
                                  }),
                                }] }>
                                    <X.Button
                                        style={ Styles.onboardingTouchGateButton }
                                        onPress={ () => { this.handleDisengageVisualPressed('disengage') } } />
                                </Animated.View>
                            </View>
                        ) : null }
                    </View>
                ) : null }

                <Animated.View
                    style={ overlayStyle }>
                    <X.Gradient
                        color={ gradientColor }>
                        { this.renderStep() }
                    </X.Gradient>
                </Animated.View>
            </View>
        )
    }
}

const mapStateToProps = state => ({});

const mapDispatchToProps = dispatch => ({
    completeTrainingStep: completeTrainingStep('Onboarding', dispatch),
    restartTraining: () => {
        onTrainingRouteCompleted('Onboarding');
    },
});
export default connect(mapStateToProps, mapDispatchToProps)(Onboarding);
